/* @layer renderer-components @kind component */
import { useRef, useEffect, useMemo } from 'react';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../game';
import { buildDrawContext } from '@app/navigation-overlay/draw/draw-context';
import { drawReachableDots } from '@app/navigation-overlay/draw/draw-dots';
import { drawPathPreview } from '@app/navigation-overlay/draw/draw-path';
import { drawCliffArrows } from '@app/navigation-overlay/draw/draw-cliff-arrows';
import { drawStairArrows } from '@app/navigation-overlay/draw/draw-stair-arrows';
import { drawConnections } from '@app/navigation-overlay/draw/draw-connections';
import { drawEntrances } from '@app/navigation-overlay/draw/draw-entrances';
import { drawFallHoleSpawns } from '@app/navigation-overlay/draw/draw-fall-hole-spawns';
import { drawPitStripes } from '@app/navigation-overlay/draw/draw-pit-stripes';
import { drawPlayerDebug } from '@app/navigation-overlay/draw/draw-player-debug';
import { drawAnnotations } from '@app/navigation-overlay/draw/draw-annotations';
import type { OverlayCanvasProps } from './OverlayCanvas.type';

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
      if (!vp?.isGameplay) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dc = buildDrawContext(ctx, vp, width, height, result, isIndoors);
      const drawResults = results.length > 0 ? results : [result];

      drawReachableDots(dc, drawResults, layer1ReachableOverride);
      drawPathPreview(dc, { mouseState: mouseStateRef.current, result, vp, setLockedPath });
      drawCliffArrows(dc, drawResults);
      drawStairArrows(dc, drawResults);
      drawConnections(dc, connections);
      drawEntrances(dc, crossings, isIndoors);
      if (isIndoors) {
        drawFallHoleSpawns(dc, fallHoleSpawns, activeScreenIndex, drawResults);
      }
      drawPitStripes(dc, drawResults);
      if (annotations.length) drawAnnotations(dc, annotations, hiddenKinds);
      drawPlayerDebug(dc, vp, wasmGetLiveSprites());

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, result, results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, width, height, gameRunning, activeScreenIndex, isIndoors, roomIndex, layer1ReachableOverride, mouseStateRef, setLockedPath]);

  const canvasStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width,
    height,
    pointerEvents: 'none' as const,
    zIndex: 5,
  }), [width, height]);

  return (
    <Canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={canvasStyle}
    />
  );
};

export { OverlayCanvas };
