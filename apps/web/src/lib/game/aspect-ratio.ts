/* @layer bridge-wasm @kind logic */
/**
 * Aspect-ratio math shared by the screen + HUD settings: validation for the custom W:H inputs,
 * device-screen detection for the prefill, and resolution of a ratio setting to a numeric value.
 * The bounds mirror core/zelda3 — MAX_ASPECT tracks kPpuExtraLeftRight so the render buffer can
 * always supply the columns a permitted ratio needs.
 */

const BASE_WIDTH = 256;
const MAX_EXTRA = 152; // kPpuExtraLeftRight — the PPU linear-world fetch renders past the 512px SNES tilemap with no-wrap clamping (no edge garbage); 152 (~21:9 / 2.5:1) is the verified-safe ceiling before a separate latent OOB in the vendored widescreen path
const MAX_RENDER_H = 240; // extendY height — the worst case, needs the most columns for a ratio

const MIN_ASPECT = 4 / 3; // native; wider is allowed, taller is not
const MAX_ASPECT = (BASE_WIDTH + 2 * MAX_EXTRA) / MAX_RENDER_H; // = 2.13 (~19:9); the SNES 512px tilemap limit

interface RatioCheck {
  valid: boolean;
  ratio: number;
  error?: string;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const validateCustomRatio = (w: number, h: number): RatioCheck => {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) {
    return { valid: false, ratio: 0, error: 'Use whole numbers ≥ 1' };
  }
  const ratio = w / h;
  if (ratio < MIN_ASPECT - 1e-6) return { valid: false, ratio, error: 'Cannot be taller than 4:3' };
  if (ratio > MAX_ASPECT + 1e-6) {
    return { valid: false, ratio, error: `Max is ${Math.round(MAX_ASPECT * 100) / 100}:1` };
  }
  return { valid: true, ratio };
};

/** Sum of the horizontal safe-area (cutout) insets in CSS px, from the vars the native shell injects. */
const horizontalSafeInset = (): number => {
  if (typeof document === 'undefined') return 0;
  const cs = getComputedStyle(document.documentElement);
  return (parseFloat(cs.getPropertyValue('--sai-left')) || 0) + (parseFloat(cs.getPropertyValue('--sai-right')) || 0);
};

/** Clamp a long:short pixel pair to [MIN_ASPECT, MAX_ASPECT] and reduce to the minimal integer ratio. */
const clampAndReduce = (longPx: number, shortPx: number): { w: number; h: number } => {
  let long = longPx;
  let short = shortPx;
  const ratio = long / short;
  if (ratio < MIN_ASPECT) {
    long = 4;
    short = 3;
  } else if (ratio > MAX_ASPECT) {
    long = Math.round(MAX_ASPECT * short);
  }
  const g = gcd(long, short) || 1;
  return { w: long / g, h: short / g };
};

// Landscape-normalized long:short pixel pair for the physical screen / current viewport. When
// renderIntoNotch is false the long edge drops the horizontal camera-cutout insets.
const screenDims = (renderIntoNotch: boolean): { long: number; short: number } => {
  const sw = (typeof window !== 'undefined' && window.screen?.width) || 16;
  const sh = (typeof window !== 'undefined' && window.screen?.height) || 9;
  let long = Math.round(sw >= sh ? sw : sh);
  const short = Math.round(sw >= sh ? sh : sw);
  if (!renderIntoNotch) long = Math.max(short, Math.round(long - horizontalSafeInset()));
  return { long, short };
};

const viewportDims = (renderIntoNotch: boolean): { long: number; short: number } => {
  const vw = (typeof window !== 'undefined' && window.innerWidth) || 16;
  const vh = (typeof window !== 'undefined' && window.innerHeight) || 9;
  let long = Math.round(vw >= vh ? vw : vh);
  const short = Math.round(vw >= vh ? vh : vw);
  if (!renderIntoNotch) long = Math.max(short, Math.round(long - horizontalSafeInset()));
  return { long, short };
};

/** Physical device SCREEN as a clamped integer ratio (landscape-normalized) — fixed per device. */
const detectScreenRatio = (renderIntoNotch = true): { w: number; h: number } => {
  const { long, short } = screenDims(renderIntoNotch);
  return clampAndReduce(long, short);
};

/** Current APP VIEWPORT as a clamped integer ratio — varies with the window/usable area and, when
 *  renderIntoNotch is false, excludes the camera-cutout insets (so it adapts to the notch, not the screen). */
const detectViewportRatio = (renderIntoNotch = true): { w: number; h: number } => {
  const { long, short } = viewportDims(renderIntoNotch);
  return clampAndReduce(long, short);
};

interface RatioReadout {
  detected: number; // true measured ratio (uncapped)
  used: number; // ratio the engine will actually render (clamped to MAX_ASPECT)
  capped: boolean; // detected exceeded the engine limit and was reduced
}

const buildReadout = (long: number, short: number): RatioReadout => {
  const detected = long / short;
  const u = clampAndReduce(long, short);
  return { detected, used: u.w / u.h, capped: detected > MAX_ASPECT + 1e-6 };
};

// Standard display ratios real screens use, plus the engine's exact cap (32:15 = 512/240). Screens
// are always one of these, so snapping to the nearest avoids meaningless GCD pairs like "29:13".
const COMMON_RATIOS: ReadonlyArray<readonly [number, number]> = [
  [4, 3], [3, 2], [16, 10], [5, 3], [16, 9], [17, 9], [18, 9], [19, 9], [32, 15], [20, 9], [21, 9],
];

/** Snap a measured numeric ratio to the nearest standard display ratio, so 2.226 reads as "20:9"
 *  (not "29:13" / "2.23:1") and the capped value reads as its exact "32:15". */
const niceRatio = (target: number): { w: number; h: number } => {
  let best = COMMON_RATIOS[0];
  let bestErr = Infinity;
  for (const pair of COMMON_RATIOS) {
    const err = Math.abs(pair[0] / pair[1] - target);
    if (err < bestErr) {
      bestErr = err;
      best = pair;
    }
  }
  return { w: best[0], h: best[1] };
};

/** Detected-vs-used screen ratio for the settings readout. */
const screenReadout = (renderIntoNotch = true): RatioReadout => {
  const { long, short } = screenDims(renderIntoNotch);
  return buildReadout(long, short);
};

/** Detected-vs-used app-viewport ratio for the settings readout. */
const viewportReadout = (renderIntoNotch = true): RatioReadout => {
  const { long, short } = viewportDims(renderIntoNotch);
  return buildReadout(long, short);
};

/** Concrete W:H for a custom setting; the 0/0 sentinel resolves to the detected screen ratio. */
const effectiveCustomRatio = (w: number, h: number, renderIntoNotch = true): { w: number; h: number } =>
  w > 0 && h > 0 ? { w, h } : detectScreenRatio(renderIntoNotch);

/** Numeric ratio of a "W:H" string; 'match' and malformed values return 0 (caller treats as full width). */
const parseRatioString = (ratio: string): number => {
  const [w, h] = ratio.split(':').map(Number);
  return w > 0 && h > 0 ? w / h : 0;
};

/** Numeric ratio of a ratio setting, resolving 'custom' against its W:H (or the detected screen). */
const aspectRatioValue = (ratio: string, customW: number, customH: number, renderIntoNotch = true): number => {
  if (ratio === 'auto') {
    const { w, h } = detectViewportRatio(renderIntoNotch);
    return w / h;
  }
  if (ratio === 'screen') {
    const { w, h } = detectScreenRatio(true);
    return w / h;
  }
  if (ratio === 'custom') {
    const { w, h } = effectiveCustomRatio(customW, customH, renderIntoNotch);
    return w / h;
  }
  return parseRatioString(ratio);
};

export { MIN_ASPECT, MAX_ASPECT, validateCustomRatio, detectScreenRatio, detectViewportRatio, screenReadout, viewportReadout, niceRatio, effectiveCustomRatio, parseRatioString, aspectRatioValue };
export type { RatioCheck, RatioReadout };
