/* @layer renderer-components @kind component */
import { useRef, useEffect } from 'react';
import { Canvas } from '@ds/primitives/Canvas';
import { poseCanvasSize, framesOf } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PoseState } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { Facing } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { composeFrame } from '@app/lib/game/player-sheet/compose-frame';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface PoseCanvasProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  state: PoseState;
  facing: Facing;
  /** Shared clock; the canvas takes it modulo its own frame count. */
  tick: number;
  scale: number;
  className?: string;
}

const { width, height, originX, originY } = poseCanvasSize();

/** One facing of one state, drawn at the shared clock's current frame. */
const PoseCanvas = (props: PoseCanvasProps) => {
  const { sheet, row, state, facing, tick, scale, className = '' } = props;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const frames = framesOf(state, facing);
    ctx.clearRect(0, 0, width, height);
    if (frames.length === 0) return;
    const frame = frames[tick % frames.length];
    const image = ctx.createImageData(width, height);
    composeFrame({
      dest: new Uint32Array(image.data.buffer),
      destWidth: width,
      destHeight: height,
      sheet,
      row,
      frame,
      originX,
      originY,
    });
    ctx.putImageData(image, 0, 0);
  }, [sheet, row, state, facing, tick]);

  return (
    <Canvas
      ref={ref}
      width={width}
      height={height}
      className={`pose-canvas${className ? ` ${className}` : ''}`}
      style={{ width: width * scale, height: height * scale }}
    />
  );
};

export { PoseCanvas };
export type { PoseCanvasProps };
