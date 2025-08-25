"use client";
import React, { useRef, useState } from "react";
import { useVideoToLandmarks } from "@/hooks/useVideoToLandmarks";
import LiveLandmarkCoordsDisplay from "@/components/liveLandmarkCoordsDisplay";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [primaryView, setPrimaryView] = useState<"videoNLandmark" | "landmark">("videoNLandmark");
  const [showLiveLandmarkCoordsDisplay, setShowLiveLandmarkCoordsDisplay] = useState<boolean>(false);

  // Get live landmarks from the hook
  const landmarks = useVideoToLandmarks(videoRef, canvasRef);

  return (
    <div className="relative w-screen h-screen bg-black">
      <div className="flex flex-row gap-1">
        <button
          onClick={() =>
            setPrimaryView((prev) => (prev === "videoNLandmark" ? "landmark" : "videoNLandmark"))
          }
          className="absolute top-4 right-4 z-50 bg-white px-4 py-2 rounded shadow"
        >
          Swap View
        </button>

        <button
          onClick={() =>
            setShowLiveLandmarkCoordsDisplay((prev) => !prev)
          }
          className="absolute top-16 right-4 z-50 bg-white px-4 py-2 rounded shadow"
        >
          Display Live Landmark Coordinates
        </button>
      </div>

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

        {showLiveLandmarkCoordsDisplay && (
          // Live landmark coordinates display at bottom-left
          <div className="absolute bottom-4 left-4 z-50 space-y-1">
            {landmarks.hands[0] && (
              <LiveLandmarkCoordsDisplay coordinates={landmarks.hands[0]} label="Left Hand" />
            )}
            {landmarks.hands[1] && (
              <LiveLandmarkCoordsDisplay coordinates={landmarks.hands[1]} label="Right Hand" />
            )}
            {landmarks.pose.length > 0 && (
              <LiveLandmarkCoordsDisplay coordinates={landmarks.pose} label="Pose" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
