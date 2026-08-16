/* @layer renderer-components @kind component */
import { useRef, useEffect, useMemo } from 'react';
import { Canvas } from '../../../../../../design-system/primitives/Canvas';
import { useNavigationOverlayStore } from '../../../../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../../../lib/game';
import type { ReachState } from '@shared/game/navigation/types';
import type { Props, MouseState } from './navigation-overlay.type';
import { buildDrawContext } from './draw/draw-context';
import { drawReachableDots } from './draw/draw-dots';
import { drawPathPreview } from './draw/draw-path';
import { drawCliffArrows, drawStairArrows } from './draw/draw-arrows';
import { drawConnections } from './draw/draw-connections';
import { drawEntrances } from './draw/draw-entrances';
import { drawFallHoleSpawns, drawPitStripes } from './draw/draw-fall-zones';
import { drawPlayerDebug } from './draw/draw-player-debug';
import { drawAnnotations } from './draw/draw-annotations';

interface OverlayCanvasProps extends Props {
  mouseStateRef: React.RefObject<MouseState>;
}

const OverlayCanvas = ({ width, height, gameRunning, mouseStateRef }: OverlayCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { visible, result, results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, setLockedPath } = useNavigationOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  const layer1ReachableOverride = useMemo(() => {
    if (!result?.reachableByLayer) return null;
    return result.reachableByLayer;
  }, [result?.reachableByLayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible || !result || !gameRunning) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const vp = wasmGetViewportInfo();
      if (!vp || !vp.isGameplay) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dc = buildDrawContext(ctx, vp, width, height, result, isIndoors);
      const drawResults = results.length > 0 ? results : [result];

      drawReachableDots(dc, drawResults, layer1ReachableOverride);
      drawPathPreview(dc, mouseStateRef.current, result, vp, setLockedPath);
      drawCliffArrows(dc, drawResults);
      drawStairArrows(dc, drawResults);
      drawConnections(dc, connections);
      drawEntrances(dc, crossings, isIndoors);
      if (isIndoors) {
        drawFallHoleSpawns(dc, fallHoleSpawns, activeScreenIndex, drawResults);
      }
      drawPitStripes(dc, drawResults);
      // Annotations last so locks/triggers/exits sit above the reachability art.
      if (annotations.length) drawAnnotations(dc, annotations, hiddenKinds);
      drawPlayerDebug(dc, vp, wasmGetLiveSprites());

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, result, results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, width, height, gameRunning, activeScreenIndex, isIndoors, roomIndex, layer1ReachableOverride, mouseStateRef, setLockedPath]);

  return (
    <Canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        height,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
};

export { OverlayCanvas };
