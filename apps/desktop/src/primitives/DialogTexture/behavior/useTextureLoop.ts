/* @layer renderer-hud @kind hook */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { DialogTextureAnimation } from '@rotp/game-data';
import { paintTexture } from '@rotp/game-core';
import type { DialogTextureProps } from '../DialogTexture.type';

const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useTextureLoop = (canvasRef: RefObject<HTMLCanvasElement | null>, params: DialogTextureProps): void => {
  const { width, height, unit, texture, color, opacity, animation, speed, scale, density, scatter } = params;
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0 || unit <= 0) return;
    const motion: DialogTextureAnimation = reducedMotion() ? 'none' : animation;
    const devicePx = unit * (window.devicePixelRatio || 1);
    startRef.current ??= performance.now();
    const start = startRef.current;
    const paint = (now: number): void => {
      paintTexture(canvas, {
        texture, color, opacity, animation: motion, speed, scale, density, scatter,
        t: (now - start) / 1000, widthPx: width / unit, heightPx: height / unit, devicePx,
      });
    };
    if (texture === 'none' || motion === 'none') {
      paint(performance.now());
      return;
    }
    let raf = requestAnimationFrame(function loop(now) {
      paint(now);
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, width, height, unit, texture, color, opacity, animation, speed, scale, density, scatter]);
};

export { useTextureLoop };
