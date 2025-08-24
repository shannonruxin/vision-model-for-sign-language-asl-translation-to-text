import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";

export async function initHandLandmarker(videoElement: HTMLVideoElement, onResults: (result: HandLandmarkerResult) => void) {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    },
    numHands: 2, // detect both hands
    runningMode: "VIDEO",
  });

  async function detectHands() {
    if (videoElement.readyState >= 2) {
      const results = handLandmarker.detectForVideo(videoElement, performance.now());
      onResults(results);
    }
    requestAnimationFrame(detectHands);
  }

  detectHands();
}
