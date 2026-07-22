/**
 * Feature flags.
 *
 * USE_DIRECT_UPLOAD — switches media uploads (image / audio / video) from the
 * legacy "multipart file through our API" flow to the new direct-to-S3 presigned
 * upload + background transcoding (VOD) flow. See docs/vod/*.md.
 *
 * Keep this OFF until the new flow is verified end-to-end in staging, then flip
 * it ON per the rollout in docs/vod/frontend-vod-implementation.md (§8). The old
 * upload path stays intact and is used whenever this is false.
 */
export const USE_DIRECT_UPLOAD = true
