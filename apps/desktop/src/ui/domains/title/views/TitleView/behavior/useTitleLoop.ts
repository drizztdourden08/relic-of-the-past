/* @layer renderer-hud @kind hook */
import { useEffect, useMemo, useRef } from 'react';
import { wasmGetTitleFrame, wasmGetTitleHidden, wasmGetTitlePalette, wasmGetTitlePoly, wasmSetTitleHidden } from '@rotp/game-core';
import { phaseOf } from '@rotp/game-data';
import { buildScene } from '../../../scene/compose-scene';
import { createTriforcePicture } from '../../../choreography/create-triforce-picture';
import { drawTitleFrame } from '../../../choreography/draw-title-frame';
import { createShine } from '../../../choreography/draw-shine';
import { shinePixelsOf } from '../../../choreography/shine-pixels';
import { createLogoSweep } from '../../../choreography/logo-sweep';
import { DRIFT_PX_PER_SECOND } from '../TitleView.constants';
import type { LoopOptions } from '../TitleView.type';

const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useTitleLoop = (canvasRef: React.RefObject<HTMLCanvasElement | null>, options: LoopOptions): void => {
  const { assets, geometry, moving, dimFlashes, onResting } = options;
  const seed = useMemo(() => Math.floor(Math.random() * 0x7fffffff) || 1, []);
  const triforce = useMemo(createTriforcePicture, []);
  const live = useRef({ moving, dimFlashes, onResting });
  live.current = { moving, dimFlashes, onResting };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!assets || !geometry || !canvas) {
      wasmSetTitleHidden(false);
      live.current.onResting(false);
      return;
    }
    let resting = false;
    const noteResting = (now: boolean): void => {
      if (now === resting) return;
      resting = now;
      live.current.onResting(now);
    };
    canvas.width = geometry.width;
    canvas.height = geometry.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sceneCanvas = document.createElement('canvas');
    sceneCanvas.width = geometry.width;
    sceneCanvas.height = geometry.height;
    const scene = buildScene(assets.scene, geometry, seed);
    const shine = createShine(seed, shinePixelsOf(assets.pictures.logo, assets.pictures.sword));
    const sweep = createLogoSweep(seed);
    const still = reducedMotion();
    const t0 = performance.now();
    let raf = 0;
    wasmSetTitleHidden(true);
    const tick = (now: number): void => {
      raf = requestAnimationFrame(tick);
      const frame = wasmGetTitleFrame();
      if (!frame) return;
      const coreTitleHidden = wasmGetTitleHidden();
      const t = (now - t0) / 1000;
      const motion = live.current.moving && !still;
      drawTitleFrame(ctx, {
        frame, scene, sceneCanvas, pictures: assets.pictures, triforce, coreTitleHidden, shine, sweep,
        clock: { t, drift: motion ? t * DRIFT_PX_PER_SECOND : 0, moving: !still },
        poly: wasmGetTitlePoly(), palette: wasmGetTitlePalette(), dimFlashes: live.current.dimFlashes,
      });
      noteResting(coreTitleHidden && phaseOf(frame) === 'idle' && frame.module === 0);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      noteResting(false);
      wasmSetTitleHidden(false);
    };
  }, [assets, geometry, canvasRef, seed, triforce]);
};

export { useTitleLoop };
