/* @layer renderer-widgets @kind component */
import { useCallback } from 'react';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { paintReachability } from '../behavior/paint-reachability';
import type { ReachabilityCanvasProps } from './ReachabilityCanvas.type';
import './ReachabilityCanvas.css';

const ReachabilityCanvas = ({ reachable, bounds, tileLayer }: ReachabilityCanvasProps) => {
  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) paintReachability(canvas, { reachable, bounds, tileLayer });
  }, [reachable, bounds, tileLayer]);

  return <Canvas ref={ref} className="nav-reachability-canvas" />;
};

export { ReachabilityCanvas };
