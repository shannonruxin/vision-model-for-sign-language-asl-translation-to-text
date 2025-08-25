// src/hooks/useVideoToLandmarks.ts
import { useEffect, useState, MutableRefObject } from "react";
import { FilesetResolver, HandLandmarker, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export function useVideoToLandmarks(
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
) {
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);

  useEffect(() => {
    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      setHandLandmarker(await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      }));
      setPoseLandmarker(await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        },
        runningMode: "VIDEO",
      }));
    })();
  }, []);

  useEffect(() => {
    if (!handLandmarker || !poseLandmarker || !videoRef.current) return;

    const video = videoRef.current;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();

      video.onloadeddata = () => {
        const loop = async () => {
          if (!canvasRef.current || !videoRef.current) return;
          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) return;

          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // draw video + landmarks
          ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const draw = new DrawingUtils(ctx);

          const hands = await handLandmarker.detectForVideo(video, performance.now());
          hands.landmarks?.forEach(lm => {
            draw.drawLandmarks(lm, { color: "red", radius: 4 });
            draw.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: "blue" });
          });

          const pose = await poseLandmarker.detectForVideo(video, performance.now());
          pose.landmarks?.forEach(lm => {
            draw.drawLandmarks(lm, { color: "green", radius: 4 });
            draw.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: "yellow" });
          });

          requestAnimationFrame(loop);
        };
        loop();
      };
    });
  }, [handLandmarker, poseLandmarker]);
}
