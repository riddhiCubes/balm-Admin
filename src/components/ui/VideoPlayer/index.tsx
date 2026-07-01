import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const index = ({ videoUrl, poster }: { videoUrl: string, poster?: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoUrl.endsWith(".m3u8") && Hls.isSupported() && videoRef.current) {
      const hls = new Hls({
        startLevel: -1,
        maxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
        maxMaxBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        maxBufferHole: 0.5,
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        // Removed the autoplay logic here
        // No automatic play after the manifest is parsed
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error("HLS.js Error", data);
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current) {
      videoRef.current.src = videoUrl;
      // Removed the autoplay logic here as well
      // No automatic play for non-HLS video
    }
  }, [videoUrl]);

  return (
    <video
      ref={videoRef}
      className="rounded-md  object-cover object-center reels-video h-full w-full"
      poster={poster}
      controls
      preload="auto"
      controlsList="nofullscreen"

    >
      <source src={`${videoUrl}`} type="video/mp4" />
    </video>
  );
};

export default index;
