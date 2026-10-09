/* @layer renderer-components @kind component */
import { useRef, useEffect } from 'react';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { poseCanvasSize, framesOf } from '@rotp/game-data';
import { composeFrame } from '@rotp/packs';
import type { PoseCanvasProps } from './PoseCanvas.type';
import './PoseCanvas.css';

const { width, height, originX, originY } = poseCanvasSize();

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
