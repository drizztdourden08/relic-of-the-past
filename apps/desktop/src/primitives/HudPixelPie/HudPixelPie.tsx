/* @layer renderer-hud @kind component */
import { useEffect, useMemo, useRef } from 'react';
import { GRID_SIZE } from './HudPixelPie.constants';
import { paintGrid } from './behavior/paint-grid';
import { rasterizePie } from './behavior/rasterize-pie';
import { buildSliceMap } from './behavior/build-slice-map';
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
