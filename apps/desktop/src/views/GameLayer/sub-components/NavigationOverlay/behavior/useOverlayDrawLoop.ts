/* @layer renderer-components @kind hook */
import { useRef, useEffect } from 'react';
import { useNavigationOverlayStore } from '../../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { wasmGetViewportInfo } from '../../../../../game';
import { drawOverlayFrame } from '@app/navigation-overlay/draw/draw-overlay-frame';
import type { OverlayDrawLoopParams } from './useOverlayDrawLoop.type';

const useOverlayDrawLoop = (params: OverlayDrawLoopParams): void => {
  const { canvasRef, width, height, gameRunning, mouseStateRef } = params;
  const rafRef = useRef<number>(0);
  const { visible, result, results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, setLockedPath } = useNavigationOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;
  const perLayer = result?.reachableByLayer ?? null;

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

    const overlay = { results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, setLockedPath };
    const draw = () => {
      const vp = wasmGetViewportInfo();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (vp?.isGameplay) {
        drawOverlayFrame({ ctx, vp, width, height, result, isIndoors, activeScreenIndex, perLayer, mouseState: mouseStateRef.current, overlay });
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, result, results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, width, height, gameRunning, activeScreenIndex, isIndoors, roomIndex, perLayer, mouseStateRef, setLockedPath]);
};

export { useOverlayDrawLoop };
