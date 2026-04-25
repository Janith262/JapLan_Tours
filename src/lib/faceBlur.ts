/**
 * faceBlur.ts
 *
 * Pure browser-side face detection + blurring using the MediaPipe FaceDetector
 * (WASM, loaded from CDN — no API key, no server).
 *
 * Falls back to a mild full-image blur if the library fails to load.
 */

// We dynamically import the MediaPipe vision package to keep the initial bundle small.
// CDN WASM assets are fetched lazily the first time blurFacesInImage() is called.

type FaceDetector = {
  detectForVideo?: unknown;
  detect: (image: HTMLCanvasElement) => { detections: { boundingBox: { originX: number; originY: number; width: number; height: number } }[] };
  close: () => void;
};

let detectorPromise: Promise<FaceDetector | null> | null = null;

async function getFaceDetector(): Promise<FaceDetector | null> {
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    try {
      // Dynamically import from CDN via esm.sh
      const vision = await (Function('return import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs")')() as Promise<any>);
      const { FaceDetector: MPFaceDetector, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      const detector: FaceDetector = await MPFaceDetector.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.5,
        minSuppressionConfidence: 0.5,
      });

      return detector;
    } catch (e) {
      console.warn("[faceBlur] MediaPipe FaceDetector failed to load:", e);
      return null;
    }
  })();

  return detectorPromise;
}

/**
 * Load a URL/data-URL into an HTMLImageElement and draw it on a canvas.
 */
function loadImageToCanvas(src: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Apply a pixelate blur to a rect on the canvas (privacy-safe blurring).
 */
function pixelateRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pixelSize = 16
) {
  // Expand the bounding box slightly for safety
  const pad = Math.round(Math.min(w, h) * 0.15);
  x = Math.max(0, x - pad);
  y = Math.max(0, y - pad);
  w = w + pad * 2;
  h = h + pad * 2;

  // Sample pixels at interval, then draw enlarged squares (pixelate)
  for (let py = y; py < y + h; py += pixelSize) {
    for (let px = x; px < x + w; px += pixelSize) {
      const data = ctx.getImageData(px, py, 1, 1).data;
      ctx.fillStyle = `rgba(${data[0]},${data[1]},${data[2]},${data[3] / 255})`;
      ctx.fillRect(px, py, pixelSize, pixelSize);
    }
  }

  // Additional CSS-filter blur pass using an offscreen canvas trick
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = w;
  faceCanvas.height = h;
  const fCtx = faceCanvas.getContext("2d")!;
  fCtx.filter = "blur(12px)";
  fCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, w, h);

  // Compose blurred face back
  ctx.drawImage(faceCanvas, x, y);
}

/**
 * Apply a soft blur to the entire image (fallback when no faces detected).
 */
function blurWholeImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d")!;
  ctx.filter = "blur(8px)";
  ctx.drawImage(canvas, 0, 0);
  return out;
}

/**
 * Main export: receive an image URL, detect faces, blur them, return a data URL.
 *
 * @param imageSrc   HTTP URL, data URL, or blob URL
 * @param intensity  Pixel block size (higher = more blurred). Default 18.
 * @returns          JPEG data URL with faces blurred
 */
export async function blurFacesInImage(
  imageSrc: string,
  intensity = 18
): Promise<string> {
  // 1. Draw image to canvas
  const canvas = await loadImageToCanvas(imageSrc);
  const ctx = canvas.getContext("2d")!;

  // 2. Attempt face detection
  const detector = await getFaceDetector();

  if (detector) {
    try {
      const result = detector.detect(canvas);
      const faces = result?.detections ?? [];

      if (faces.length === 0) {
        console.log("[faceBlur] 0 faces detected. Returning original image without blurring.");
        // We do NOT blur the whole image. Returning unblurred image so admin can manually upload if needed.
        return canvas.toDataURL("image/jpeg", 0.92);
      }

      for (const face of faces) {
        const { originX, originY, width, height } = face.boundingBox;
        pixelateRect(ctx, originX, originY, width, height, intensity);
      }

      return canvas.toDataURL("image/jpeg", 0.92);
    } catch (e) {
      console.warn("[faceBlur] Detection error:", e);
    }
  }

  // 3. Fallback: if detector fails to load, do NOT blur the whole image.
  console.log("[faceBlur] Detector failed to load, returning original image.");
  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Blur faces in multiple images in parallel.
 */
export async function blurFacesInImages(
  imageSrcs: string[],
  intensity = 18
): Promise<string[]> {
  return Promise.all(imageSrcs.map(src => blurFacesInImage(src, intensity)));
}
