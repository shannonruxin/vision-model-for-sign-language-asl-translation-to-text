"use client";
import React, { useRef, useState } from "react";
import { useVideoToLandmarks } from "@/hooks/useVideoToLandmarks";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [primaryView, setPrimaryView] = useState<"videoNLandmark" | "landmark">("videoNLandmark");

  useVideoToLandmarks(videoRef, canvasRef);

  return (
    <div className="relative w-screen h-screen bg-black">
      <button
        onClick={() =>
          setPrimaryView((prev) => (prev === "videoNLandmark" ? "landmark" : "videoNLandmark"))
        }
        className="absolute top-4 right-4 z-50 bg-white px-4 py-2 rounded shadow"
      >
        Swap View
      </button>

      <div className="w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          className={`${
            primaryView === "videoNLandmark"
              ? "w-full h-full"
              : "w-1/4 h-1/4 bottom-4 right-4 absolute"
          }`}
          style={{ objectFit: "cover" }}
        />
        <canvas
          ref={canvasRef}
          className={`${
            primaryView === "videoNLandmark"
              ? "w-1/4 h-1/4 bottom-4 right-4 absolute"
              : "w-full h-full"
          }`}
        />
      </div>
    </div>
  );
}
