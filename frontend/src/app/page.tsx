"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [primaryView, setPrimaryView] = useState<"videoNLandmark" | "landmark">("videoNLandmark");

  useEffect(() => {
    async function initMediapipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const hand = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      setHandLandmarker(hand);

      const pose = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        },
        runningMode: "VIDEO",
      });
      setPoseLandmarker(pose);
    }

    initMediapipe();
  }, []);

  useEffect(() => {
    if (!handLandmarker || !poseLandmarker || !videoRef.current) return;

    const video = videoRef.current;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();

      video.onloadeddata = () => {
        const drawLoop = async () => {
          if (!canvasRef.current || !videoRef.current) return;
          const canvasCtx = canvasRef.current.getContext("2d");
          if (!canvasCtx) return;

          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw video
          canvasCtx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const drawingUtils = new DrawingUtils(canvasCtx);

          // Hand detection
          const handResults = await handLandmarker.detectForVideo(video, performance.now());
          if (handResults.landmarks) {
            for (const landmarks of handResults.landmarks) {
              drawingUtils.drawLandmarks(landmarks, { color: "red", radius: 4 });
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "blue" });
            }
          }

          // Pose detection
          const poseResults = await poseLandmarker.detectForVideo(video, performance.now());
          if (poseResults.landmarks) {
            for (const landmarks of poseResults.landmarks) {
              drawingUtils.drawLandmarks(landmarks, { color: "green", radius: 4 });
              drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: "yellow" });
            }
          }

          requestAnimationFrame(drawLoop);
        };
        drawLoop();
      };
    });
  }, [handLandmarker, poseLandmarker]);

  return (
    <div className="relative w-screen h-screen bg-black">
      <button
        onClick={() => setPrimaryView((prev) => (prev === "videoNLandmark" ? "landmark" : "videoNLandmark"))}
        className="absolute top-4 right-4 z-50 bg-white px-4 py-2 rounded shadow"
      >
        Swap View
      </button>

      <div className="w-full h-full relative flex items-center justify-center">
        <video
          ref={videoRef}
          className={`${
            primaryView === "videoNLandmark"
              ? "w-full h-full" // video is big
              : "w-1/4 h-1/4 bottom-4 right-4 absolute" // video is small
          }`}
          style={{ objectFit: "cover" }}
        />
        <canvas
          ref={canvasRef}
          className={`${
            primaryView === "videoNLandmark"
              ? "w-1/4 h-1/4 bottom-4 right-4 absolute" // canvas small
              : "w-full h-full" // canvas big
          }`}
        />
      </div>
    </div>
  );
}
