/* @layer bridge-wasm @kind logic */
/**
 * Aspect-ratio math shared by the screen + HUD settings: validation for the custom W:H inputs,
 * device-screen detection for the prefill, and resolution of a ratio setting to a numeric value.
 * The bounds mirror core/zelda3 — MAX_ASPECT tracks kPpuExtraLeftRight so the render buffer can
 * always supply the columns a permitted ratio needs.
 */

const BASE_WIDTH = 256;
const MAX_EXTRA = 152; // kPpuExtraLeftRight in core/zelda3 — the verified-safe max (21:9)
const MAX_RENDER_H = 240; // extendY height — the worst case, needs the most columns for a ratio

const MIN_ASPECT = 4 / 3; // native; wider is allowed, taller is not
const MAX_ASPECT = (BASE_WIDTH + 2 * MAX_EXTRA) / MAX_RENDER_H; // = 2.33 (21:9), covers all phones

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

/** Device screen as a clamped, GCD-reduced integer ratio, landscape-normalized for the mobile shell. */
const detectScreenRatio = (): { w: number; h: number } => {
  const sw = (typeof window !== 'undefined' && window.screen?.width) || 16;
  const sh = (typeof window !== 'undefined' && window.screen?.height) || 9;
  let long = Math.round(sw >= sh ? sw : sh);
  let short = Math.round(sw >= sh ? sh : sw);
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

/** Concrete W:H for a custom setting; the 0/0 sentinel resolves to the detected screen ratio. */
const effectiveCustomRatio = (w: number, h: number): { w: number; h: number } =>
  w > 0 && h > 0 ? { w, h } : detectScreenRatio();

/** Numeric ratio of a "W:H" string; 'match' and malformed values return 0 (caller treats as full width). */
const parseRatioString = (ratio: string): number => {
  const [w, h] = ratio.split(':').map(Number);
  return w > 0 && h > 0 ? w / h : 0;
};

/** Numeric ratio of a ratio setting, resolving 'custom' against its W:H (or the detected screen). */
const aspectRatioValue = (ratio: string, customW: number, customH: number): number => {
  if (ratio === 'custom') {
    const { w, h } = effectiveCustomRatio(customW, customH);
    return w / h;
  }
  return parseRatioString(ratio);
};

export { MIN_ASPECT, MAX_ASPECT, validateCustomRatio, detectScreenRatio, effectiveCustomRatio, parseRatioString, aspectRatioValue };
export type { RatioCheck };
