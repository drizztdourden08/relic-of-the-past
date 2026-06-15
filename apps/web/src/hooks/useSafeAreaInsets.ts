/* @layer renderer-other @kind hook */
/**
 * Device safe-area (notch / display-cutout) insets, in CSS px.
 *
 * The Android shell runs edge-to-edge and *consumes* window insets so the WebView
 * fills the whole screen — which zeroes the page's env(safe-area-inset-*). So the
 * native side forwards the cutout sizes as CSS custom properties on <html>
 * (--sai-top/right/bottom/left) and fires a `rotpinsets` event. We read those here.
 * On hosts that don't inject them the values are 0 (no notch).
 */
import { useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
  hasNotch: boolean;
}

const ZERO: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0, hasNotch: false };

const readInsets = (): SafeAreaInsets => {
  const s = getComputedStyle(document.documentElement);
  const px = (name: string) => parseFloat(s.getPropertyValue(name)) || 0;
  const top = px('--sai-top');
  const right = px('--sai-right');
  const bottom = px('--sai-bottom');
  const left = px('--sai-left');
  return { top, right, bottom, left, hasNotch: Math.max(top, right, bottom, left) > 0 };
};

const useSafeAreaInsets = (): SafeAreaInsets => {
  const [insets, setInsets] = useState<SafeAreaInsets>(ZERO);

  useEffect(() => {
    const update = () => setInsets(readInsets());
    update();
    window.addEventListener('rotpinsets', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('rotpinsets', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return insets;
};

/** Reflects the notch render mode on <html> so CSS (incl. portaled dialogs) can branch. */
const applyNotchMode = (renderIntoNotch: boolean): void => {
  const root = document.documentElement;
  root.classList.toggle('notch-fill', renderIntoNotch);
  root.classList.toggle('notch-safe', !renderIntoNotch);
};

export { useSafeAreaInsets, applyNotchMode };
export type { SafeAreaInsets };
