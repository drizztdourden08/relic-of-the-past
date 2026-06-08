/* @layer renderer-components @kind component */
import { forwardRef } from 'react';
import type { CanvasProps } from './Canvas.type';

/** Plain `<canvas>` replacement — raw element lives here, in the primitive. */
const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
  return <canvas ref={ref} {...props} />;
});

export { Canvas };
