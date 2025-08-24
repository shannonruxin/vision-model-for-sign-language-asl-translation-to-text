"use client";

import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [swap, setSwap] = useState(false);

  useEffect(() => {
    async function initMediapipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      setHandLandmarker(landmarker);
    }
    initMediapipe();
  }, []);

  useEffect(() => {
    if (!handLandmarker || !videoRef.current) return;

    const video = videoRef.current;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();

      video.onloadeddata = () => {
        const drawLoop = async () => {
          if (!canvasRef.current || !videoRef.current) return; // ✅ check for null
          const canvasCtx = canvasRef.current.getContext("2d");
          if (!canvasCtx) return;

          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const result = await handLandmarker.detectForVideo(video, performance.now());
          if (result.landmarks) {
            const drawingUtils = new DrawingUtils(canvasCtx);
            for (const landmarks of result.landmarks) {
              drawingUtils.drawLandmarks(landmarks, { color: "red", radius: 4 });
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "blue" });
            }
          }
          requestAnimationFrame(drawLoop);
        };
        drawLoop();
      };
    });
  }, [handLandmarker]);

  return (
    <div className="relative w-screen h-screen bg-black">
      <button
        onClick={() => setSwap(!swap)}
        className="absolute top-4 right-4 z-50 bg-white px-4 py-2 rounded shadow"
      >
        Swap
      </button>

      <div className="w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          className={`${swap ? "w-1/4 h-1/4 bottom-4 right-4 absolute" : "w-full h-full"}`}
          style={{ objectFit: "cover" }}
        />
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className={`${swap ? "w-full h-full" : "w-1/4 h-1/4 bottom-4 right-4 absolute"}`}
        />
      </div>
    </div>
  );
}
