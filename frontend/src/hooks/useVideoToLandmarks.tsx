// This hook:
// The hook’s return value (output) is LandmarksData, while the canvas drawing is a side effect.

// 1. Returns only the live numeric coordinates in the shape of LandmarksData (hands: number[][][], pose: number[][]).
// 2. Uses the passed-in canvasRef internally (page pass canvasRef as prop to hook) to draw the stickman and video frames via DrawingUtils (side effect). This hook does NOT return the canvasRef itself; the canvasRef is still in the page and rendered there.

import { useEffect, useState, MutableRefObject } from "react";
import { LandmarksData } from "@/types/index"
import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  DrawingUtils,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export function useVideoToLandmarks(
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
) {
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [landmarks, setLandmarks] = useState<LandmarksData>({ hands: [], pose: [] });

  // Utility to convert NormalizedLandmark[] to number[][]
  const lmToNumbers = (lmArray: NormalizedLandmark[]): number[][] =>
    lmArray.map((lm) => [lm.x, lm.y, lm.z]);

  useEffect(() => {
    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      setHandLandmarker(
        await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 2,
        })
      );
      setPoseLandmarker(
        await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          },
          runningMode: "VIDEO",
        })
      );
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

          // Draw video frame
          ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const draw = new DrawingUtils(ctx);

          const handsResult = await handLandmarker.detectForVideo(video, performance.now());
          const poseResult = await poseLandmarker.detectForVideo(video, performance.now());

          // Draw and convert hands
          const handsNumeric: number[][][] = [];
          handsResult.landmarks?.forEach((lm) => {
            draw.drawLandmarks(lm, { color: "red", radius: 4 });
            draw.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: "blue" });
            handsNumeric.push(lmToNumbers(lm));
          });

          // Draw and convert pose
          let poseNumeric: number[][] = [];
          poseResult.landmarks?.forEach((lm) => {
            draw.drawLandmarks(lm, { color: "green", radius: 4 });
            draw.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: "yellow" });
            poseNumeric = lmToNumbers(lm); // Pose usually returns one array
          });

          // Update state with numeric coordinates
          setLandmarks({ hands: handsNumeric, pose: poseNumeric });

          requestAnimationFrame(loop);
        };
        loop();
      };
    });
  }, [handLandmarker, poseLandmarker]);

  return landmarks; // Now you can consume live numeric coordinates
}
