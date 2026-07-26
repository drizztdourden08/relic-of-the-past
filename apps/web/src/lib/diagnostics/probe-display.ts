/* @layer renderer-lib @kind logic */
/**
 * The display the window is currently on, as the renderer sees it. Scale factor and
 * colour capability decide how the pixel-art scaler behaves, so they matter for any
 * report about blurry or mis-sized output.
 */
import type { DisplayEnvironment } from './types';

const matches = (query: string): boolean => {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
};

const firstMatch = (queries: string[], fallback: string): string =>
  queries.find((query) => matches(`(${query})`))?.split(':')[1]?.trim() ?? fallback;

const probeDisplay = (refreshHz: number | null): DisplayEnvironment => {
  const dpr = window.devicePixelRatio;
  return {
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
    },
    nativeScreen: {
      width: Math.round(window.screen.width * dpr),
      height: Math.round(window.screen.height * dpr),
    },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    devicePixelRatio: dpr,
    orientation: window.screen.orientation?.type ?? null,
    colorScheme: matches('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    colorGamut: firstMatch(['color-gamut: rec2020', 'color-gamut: p3', 'color-gamut: srgb'], 'unknown'),
    hdr: matches('(dynamic-range: high)'),
    reducedMotion: matches('(prefers-reduced-motion: reduce)'),
    refreshHz,
  };
};

export { probeDisplay };
