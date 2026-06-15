/* @layer bridge-wasm @kind logic */
/**
 * Game-frame capture for save-state screenshots.
 *
 * Reading the game's WebGL canvas asynchronously is unreliable: the backbuffer can
 * be cleared after present, and toBlob on a hidden WebGL canvas returns blank in
 * some WebViews (Android's). Instead we piggyback on the FX render loop — a save
 * requests a capture, and the loop, right after it draws the *visible* FX canvas,
 * encodes that just-rendered frame. Reading in the same turn as the draw sidesteps
 * every async / visibility / preserveDrawingBuffer quirk.
 */

const CAPTURE_TIMEOUT_MS = 600;

let pending: ((blob: Blob | null) => void) | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

const clearPending = (): void => {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  pending = null;
};

// Copy into a 2D canvas first — toBlob is rock-solid on a 2D canvas, and drawImage
// reads the source canvas's freshly-rendered contents.
const encode = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  try {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext('2d');
    if (!ctx) return Promise.resolve(null);
    ctx.drawImage(canvas, 0, 0);
    return new Promise((resolve) => {
      try {
        copy.toBlob((blob) => resolve(blob), 'image/png');
      } catch {
        resolve(null);
      }
    });
  } catch {
    return Promise.resolve(null);
  }
};

/** Called by the FX loop right after it renders the visible canvas. */
const fulfillFrameCapture = (canvas: HTMLCanvasElement | null): void => {
  if (!pending || !canvas || !canvas.width || !canvas.height) return;
  const resolve = pending;
  clearPending();
  void encode(canvas).then(resolve);
};

/** Request a PNG of the next rendered frame. Resolves null if no frame arrives in
 *  time (e.g. the game isn't running). */
const captureGameFrameBlob = (): Promise<Blob | null> =>
  new Promise((resolve) => {
    if (pending) pending(null); // a newer request supersedes an unfulfilled one
    clearPending();
    pending = resolve;
    pendingTimer = setTimeout(() => {
      if (pending === resolve) {
        clearPending();
        resolve(null);
      }
    }, CAPTURE_TIMEOUT_MS);
  });

export { captureGameFrameBlob, fulfillFrameCapture };
