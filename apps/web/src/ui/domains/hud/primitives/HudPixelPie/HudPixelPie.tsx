/* @layer renderer-hud @kind component */
/**
 * The countdown pie drawn the way the console would: hard pixels on the game's own grid, a short
 * palette, and motion in whole steps. The canvas holds one pixel per game pixel and is scaled up
 * with no smoothing, so it lines up with the game picture under it at every HUD scale.
 */
import { useEffect, useMemo, useRef } from 'react';
import { GRID_SIZE } from './HudPixelPie.constants';
import { paintGrid } from './behavior/paint-grid';
import { rasterizePie } from './behavior/rasterize-pie';
import { buildSliceMap } from './behavior/slice-map';
import { usePieSteps } from './behavior/usePieSteps';
import type { HudPixelPieProps } from './HudPixelPie.type';
import './HudPixelPie.css';

const HudPixelPie = (props: HudPixelPieProps) => {
  const { sliceCount, slicesLeft, scale } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { leavingStep, pulseStep } = usePieSteps(slicesLeft);

  const sliceMap = useMemo(() => buildSliceMap(GRID_SIZE, sliceCount), [sliceCount]);
  const grid = useMemo(
    () => rasterizePie({ gridSize: GRID_SIZE, sliceCount, slicesLeft, leavingStep, pulseStep }, sliceMap),
    [sliceMap, sliceCount, slicesLeft, leavingStep, pulseStep],
  );

  // The canvas is repainted only when the drawn state moved, never per frame.
  useEffect(() => {
    if (canvasRef.current) paintGrid(canvasRef.current, grid, GRID_SIZE);
  }, [grid]);

  const size = GRID_SIZE * scale;
  return (
    <canvas
      ref={canvasRef}
      className="hud-pixel-pie"
      width={GRID_SIZE}
      height={GRID_SIZE}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export { HudPixelPie };
