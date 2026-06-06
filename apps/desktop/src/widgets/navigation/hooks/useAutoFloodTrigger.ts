import { useEffect, useRef } from 'react';
import { wasmGetViewportInfo, wasmGetRoomLayoutInfo } from '../../../lib/game';

interface AutoFloodTriggerOptions {
  autoRun: boolean;
  running: boolean;
  isIndoors: boolean;
  activeScreenIndex: number;
  debugTick: number;
  onTrigger: () => void;
}

/**
 * Hook that detects when a new flood fill should be triggered automatically.
 * Monitors screen changes, quadrant changes, and grounded-state transitions.
 */
function useAutoFloodTrigger(opts: AutoFloodTriggerOptions): void {
  const { autoRun, running, isIndoors, activeScreenIndex, debugTick, onTrigger } = opts;

  const prevScreenRef = useRef<number | null>(null);
  const prevLiveOverworldScreenRef = useRef<number | null>(null);
  const prevQuadrantKeyRef = useRef<string | null>(null);
  const pendingGroundedRunRef = useRef(false);
  const pendingSecondPassRef = useRef(false);
  const secondPassTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (secondPassTimerRef.current) clearTimeout(secondPassTimerRef.current);
  }, []);

  const triggerWithSecondPass = () => {
    pendingSecondPassRef.current = true;
    onTrigger();
  };

  // Post-run second pass: after a run completes, fire again to catch state that settled
  useEffect(() => {
    if (running) return;
    if (pendingSecondPassRef.current) {
      pendingSecondPassRef.current = false;
      if (secondPassTimerRef.current) clearTimeout(secondPassTimerRef.current);
      secondPassTimerRef.current = setTimeout(() => {
        onTrigger();
      }, 120);
    }
  }, [running, onTrigger]);

  // Auto-run flood fill on screen change
  useEffect(() => {
    if (!autoRun || running) return;
    if (prevScreenRef.current !== null && prevScreenRef.current !== activeScreenIndex) {
      const vp = wasmGetViewportInfo?.();
      if (vp && vp.submodule !== 0) {
        pendingGroundedRunRef.current = true;
      } else {
        triggerWithSecondPass();
      }
    }
    prevScreenRef.current = activeScreenIndex;
  }, [autoRun, activeScreenIndex, running]);

  // Auto-run on live overworld screen change (overworld only)
  useEffect(() => {
    if (!autoRun || running || isIndoors) return;
    const vp = wasmGetViewportInfo?.();
    if (!vp) return;
    const liveScreen = (((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7);
    if (prevLiveOverworldScreenRef.current !== null && prevLiveOverworldScreenRef.current !== liveScreen) {
      if (vp.submodule !== 0) {
        pendingGroundedRunRef.current = true;
      } else {
        triggerWithSecondPass();
      }
    }
    prevLiveOverworldScreenRef.current = liveScreen;
  }, [autoRun, running, isIndoors, debugTick]);

  // Check for pending grounded run each tick
  useEffect(() => {
    if (!pendingGroundedRunRef.current || !autoRun || running) return;
    const vp = wasmGetViewportInfo?.();
    if (vp && vp.submodule === 0) {
      pendingGroundedRunRef.current = false;
      triggerWithSecondPass();
    }
  }, [autoRun, running, debugTick]);

  // Auto-run on indoor quadrant change
  useEffect(() => {
    if (!autoRun || running || !isIndoors) return;
    const layout = wasmGetRoomLayoutInfo();
    if (!layout || layout.intraEdges.length === 0) return;
    const quadKey = `${layout.quadrantX},${layout.quadrantY}`;
    if (prevQuadrantKeyRef.current !== null && prevQuadrantKeyRef.current !== quadKey) {
      const vp = wasmGetViewportInfo?.();
      if (vp && vp.submodule !== 0) {
        pendingGroundedRunRef.current = true;
      } else {
        triggerWithSecondPass();
      }
    }
    prevQuadrantKeyRef.current = quadKey;
  }, [autoRun, running, isIndoors, debugTick]);
}

export { useAutoFloodTrigger };
