// src/components/StickmanCanvas.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export default function StickmanCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const setup = async () => {
      // Load hand detection model
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      handLandmarkerRef.current = handLandmarker;

      // Start camera
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Set up canvas
      if (canvasRef.current) {
        canvasRef.current.width = 300;
        canvasRef.current.height = 200;
        ctxRef.current = canvasRef.current.getContext("2d");
      }

      // Detection loop
      const detect = async () => {
        if (videoRef.current && handLandmarkerRef.current && ctxRef.current) {
          const results = await handLandmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          );

          const ctx = ctxRef.current;
          ctx.save();
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

          // Optionally show video background under stickman:
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

          if (results.landmarks) {
            const drawingUtils = new DrawingUtils(ctx);
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 2,
              });
              drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
            }
          }
          ctx.restore();
        }
        requestAnimationFrame(detect);
      };
      detect();
    };
    setup();
  }, []);

  return (
    <div className="absolute bottom-4 right-4 border border-white rounded-md shadow-lg">
      {/* Hidden video input */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} />
    </div>
  );
}
