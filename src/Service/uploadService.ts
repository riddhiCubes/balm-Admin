import axios from "axios";
import { UPLOAD_START, UPLOAD_COMPLETE, UPLOAD_STATUS, UPLOAD_ABORT } from "./Api";

/**
 * Direct-to-S3 media upload helper (VOD pipeline). See docs/vod/*.md.
 *
 * Flow per file:
 *   1. POST /upload/start      -> presigned single URL, or multipart parts
 *   2. PUT bytes DIRECTLY to S3 (no auth header)
 *   3. POST /upload/complete   -> image: ready url | audio/video: jobId + processing
 *   4. GET  /upload/status/:id -> poll until ready (audio/video only)
 *
 * Auth: /upload/* calls go through the app's default axios instance, which
 * already attaches `Authorization: Bearer <Balm_token>` via its request
 * interceptor. The raw S3 PUT uses a SEPARATE clean instance (`s3`) so it does
 * NOT carry that header and an S3 error cannot trip the global 401 -> sign-in
 * redirect.
 */

export type MediaType = "image" | "audio" | "video";

export interface UploadResult {
    url: string;
    mediaType: MediaType;
}

export type ProgressFn = (percent: number) => void;

// Clean axios instance for the presigned S3 PUT — inherits none of the global
// interceptors (no Authorization header, no 401 redirect).
const s3 = axios.create();

// /upload/* JSON call through the default (authenticated) axios instance.
const uploadApi = (url: string, body: any) =>
    axios
        .post(url, body, { headers: { "Content-Type": "application/json" } })
        .then((r) => r.data);

// Small retry wrapper for the S3 PUTs (docs §9: retry a failing part a couple times).
async function putWithRetry(
    url: string,
    body: Blob | File,
    config: any,
    retries = 2,
): Promise<any> {
    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await s3.put(url, body, config);
        } catch (err) {
            lastErr = err;
        }
    }
    throw lastErr;
}

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000; // 15 min cap (docs §9)

// Progress is reported in TWO phases so the bar keeps moving during the (often
// long) transcode step instead of freezing near 100%:
//   byte upload  ->   0 .. UPLOAD_PHASE_PCT
//   transcoding  ->   UPLOAD_PHASE_PCT .. 100  (driven by the `progress` field
//                     the backend returns on /upload/status)
// Images have no transcode step, so they jump straight to 100 on "ready".
const UPLOAD_PHASE_PCT = 50;

/**
 * Upload a single file end-to-end and resolve with its final, playable URL.
 * `onProgress` reports a single 0-100 value covering BOTH phases: byte upload
 * maps to 0..UPLOAD_PHASE_PCT, then transcoding maps to UPLOAD_PHASE_PCT..100
 * using the backend's `progress` field (so it never sits frozen at ~99%).
 */
export async function uploadMedia(
    file: File,
    onProgress: ProgressFn = () => {},
): Promise<UploadResult> {
    // Map a raw byte-upload % (0-100) into the first phase (0..UPLOAD_PHASE_PCT).
    const reportUpload = (bytesPct: number) =>
        onProgress(
            Math.round((Math.min(100, Math.max(0, bytesPct)) * UPLOAD_PHASE_PCT) / 100),
        );
    // Map a raw transcode % (0-100) into the second phase (UPLOAD_PHASE_PCT..100).
    const reportTranscode = (transPct: number) =>
        onProgress(
            Math.min(
                100,
                Math.round(
                    UPLOAD_PHASE_PCT +
                        (Math.min(100, Math.max(0, transPct)) *
                            (100 - UPLOAD_PHASE_PCT)) /
                            100,
                ),
            ),
        );

    // 1) start
    const start = await uploadApi(UPLOAD_START, {
        filename: file.name,
        contentType: file.type,
        size: file.size,
    });
    if (start?.status !== 1) {
        throw new Error("upload/start failed");
    }

    // 2) upload bytes to S3
    if (start.mode === "single") {
        await putWithRetry(start.url, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (e: any) => {
                if (e.total) reportUpload((e.loaded * 100) / e.total);
            },
        });
    } else {
        const parts: Array<{ PartNumber: number; ETag: string }> = [];
        // Byte-exact progress: (bytes from finished parts + this part's live
        // bytes) / file size. Stays correct even though the last part is smaller
        // than the rest (part-count math drifts there).
        const totalBytes = file.size || 1;
        let uploadedBytes = 0; // confirmed bytes from COMPLETED parts
        for (const p of start.parts) {
            const from = (p.partNumber - 1) * start.partSize;
            const chunk = file.slice(from, from + start.partSize);
            const put = await putWithRetry(p.url, chunk, {
                onUploadProgress: (e: any) => {
                    const loaded = uploadedBytes + (e.loaded || 0);
                    reportUpload((loaded * 100) / totalBytes);
                },
            });
            // S3 CORS is configured to expose ETag. axios lowercases header keys.
            const etag = put.headers?.etag ?? put.headers?.ETag;
            if (!etag) {
                throw new Error(`Missing ETag for part ${p.partNumber}`);
            }
            parts.push({ PartNumber: p.partNumber, ETag: etag });
            uploadedBytes += chunk.size;
            reportUpload((uploadedBytes * 100) / totalBytes);
        }
        start._parts = parts;
    }

    // 3) complete
    const complete = await uploadApi(
        UPLOAD_COMPLETE,
        start.mode === "single"
            ? { key: start.key, mediaType: start.mediaType }
            : {
                  key: start.key,
                  mode: "multipart",
                  mediaType: start.mediaType,
                  uploadId: start.uploadId,
                  parts: start._parts,
              },
    );

    if (complete.mediaStatus === "ready") {
        onProgress(100); // image (no transcode) — done.
        return { url: complete.url, mediaType: start.mediaType };
    }

    // 4) poll (audio / video transcoding). Drive the second half of the bar so
    // it keeps moving instead of freezing near the end. We CANNOT rely on the
    // backend's `progress` field alone: for small files transcoding finishes so
    // fast that the very first /status response is already `progress:100 /
    // ready`, with no in-between values — the bar would jump straight 50 -> 100.
    //
    // So we animate a synthetic "creep" on a timer that eases from 50 toward a
    // ceiling (never reaching 100 on its own), and if the backend DOES report a
    // higher real `progress`, we honor that instead. On "ready" we snap to 100.
    let s = complete;
    const startedAt = Date.now();

    // Highest transcode % shown so far (monotonic — never goes backwards).
    let transcodePct =
        typeof complete.progress === "number" ? complete.progress : 0;
    reportTranscode(transcodePct);

    // The creep only advances the bar; it never reaches 100 (that's reserved for
    // an actual "ready"), so the final snap to 100 always reads as "done".
    const CREEP_CEIL = 95;
    const creep = setInterval(() => {
        // Asymptotic ease: cover a fraction of the remaining gap each tick, so
        // it moves quickly at first then slows as it nears the ceiling.
        const next = transcodePct + (CREEP_CEIL - transcodePct) * 0.1;
        if (next > transcodePct) {
            transcodePct = Math.min(CREEP_CEIL, next);
            reportTranscode(transcodePct);
        }
    }, 500);

    try {
        while (s.mediaStatus === "processing") {
            if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
                throw new Error(
                    "Media is still processing. Please check back later.",
                );
            }
            await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
            s = await axios
                .get(`${UPLOAD_STATUS}/${complete.jobId}`)
                .then((r) => r.data);
            // Honor a real backend progress value only if it's ahead of our
            // synthetic creep (and keep it under the ceiling until "ready").
            if (
                typeof s.progress === "number" &&
                s.progress > transcodePct
            ) {
                transcodePct = Math.min(CREEP_CEIL, s.progress);
                reportTranscode(transcodePct);
            }
        }
    } finally {
        clearInterval(creep); // stop the creep whether we finish, fail, or throw
    }

    if (s.mediaStatus === "failed") {
        throw new Error(s.error || "Transcoding failed");
    }
    onProgress(100); // transcode finished.
    return { url: s.url, mediaType: start.mediaType };
}

/**
 * Upload a map of { fieldName: File } concurrently and resolve with
 * { fieldName: finalUrl }. Entries whose value is not a File are skipped
 * (e.g. an unchanged existing URL on an edit screen).
 *
 * Rejects if ANY file fails — the caller must NOT create/save the record then.
 *
 * `onOverallProgress` reports a single 0-100 number for the whole batch,
 * WEIGHTED BY FILE SIZE — a 50MB video moves the bar far more than a 20KB
 * image, so the percentage tracks real bytes transferred rather than treating
 * every file equally.
 */
export async function uploadAll(
    fileMap: Record<string, File | string | null | undefined>,
    onProgress: (field: string, percent: number) => void = () => {},
    onOverallProgress: (percent: number) => void = () => {},
): Promise<Record<string, string>> {
    const entries = Object.entries(fileMap).filter(
        ([, f]) => f instanceof File,
    ) as Array<[string, File]>;

    // Byte-weighted overall: loaded_i = size_i * percent_i / 100 ;
    // overall = Σ loaded_i / Σ size_i.
    const totalBytes = entries.reduce((sum, [, f]) => sum + f.size, 0) || 1;
    const loadedByField: Record<string, number> = {};
    const emitOverall = () => {
        const loaded = Object.values(loadedByField).reduce((s, v) => s + v, 0);
        onOverallProgress(Math.min(100, Math.round((loaded * 100) / totalBytes)));
    };

    const done = await Promise.all(
        entries.map(async ([field, file]) => {
            const { url } = await uploadMedia(file, (p) => {
                onProgress(field, p);
                loadedByField[field] = (file.size * p) / 100;
                emitOverall();
            });
            return [field, url] as const;
        }),
    );

    return Object.fromEntries(done);
}

/** Optional: abort a multipart upload if the user cancels mid-way (docs §3.5). */
export const abortUpload = (key: string, uploadId: string) =>
    axios.post(UPLOAD_ABORT, { key, uploadId });
