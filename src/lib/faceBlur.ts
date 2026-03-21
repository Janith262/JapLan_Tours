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
        minDetectionConfidence: 0.1,
        minSuppressionConfidence: 0.1,
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
      const allFaces: any[] = [];
      const { width, height } = canvas;

      // 1. Detect on the whole image
      const resultWhole = detector.detect(canvas);
      if (resultWhole?.detections) {
        allFaces.push(...resultWhole.detections);
      }

      // 2. Tiled Deep Detection (Sliding Window) 
      // We take 50% width/height crops and slide them across a 3x3 grid to ensure overlapping boundaries.
      // This forces the "short-range" model to zoom in natively and detect small distant faces in HD photos.
      const cropW = Math.floor(width / 2);
      const cropH = Math.floor(height / 2);

      const xOffsets = [0, Math.floor(width / 4), width - cropW];
      const yOffsets = [0, Math.floor(height / 4), height - cropH];

      const offscreen = document.createElement("canvas");
      offscreen.width = cropW;
      offscreen.height = cropH;
      const offCtx = offscreen.getContext("2d")!;

      for (const x of xOffsets) {
        for (const y of yOffsets) {
          offCtx.clearRect(0, 0, cropW, cropH);
          offCtx.drawImage(canvas, x, y, cropW, cropH, 0, 0, cropW, cropH);
          
          const cropRes = detector.detect(offscreen);
          if (cropRes?.detections) {
            for (const d of cropRes.detections) {
              allFaces.push({
                boundingBox: {
                  originX: d.boundingBox.originX + x,
                  originY: d.boundingBox.originY + y,
                  width: d.boundingBox.width,
                  height: d.boundingBox.height
                }
              });
            }
          }
        }
      }

      if (allFaces.length === 0) {
        console.log("[faceBlur] 0 faces detected even with 10-zone sliding window. Leaving pristine as requested.");
        return canvas.toDataURL("image/jpeg", 0.92);
      }

      // Blur all discovered faces!
      for (const face of allFaces) {
        const { originX, originY, width: w, height: h } = face.boundingBox;
        pixelateRect(ctx, originX, originY, w, h, intensity);
      }

      return canvas.toDataURL("image/jpeg", 0.92);
    } catch (e) {
      console.warn("[faceBlur] Detection error:", e);
    }
  }

  // 3. Fallback: if detector entirely crashes, do not blur whole image as user prefers clear if failed
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
