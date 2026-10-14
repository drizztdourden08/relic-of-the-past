/* @layer renderer-widgets @kind hook */
import { useEffect, useRef, useCallback } from 'react';
import { isAutoFlood } from '@app/startup/is-auto-flood';
import { setDeveloperToolsOverride } from '@rotp/game-core';
import { reassertFeatureFlags } from '../../../game';
import { inventoryKeyOf } from './inventory-key-of';
import { useFloodOnTransition } from './useFloodOnTransition';
import type { AutoFloodParams } from './hooks.type';

let didApplyAutoFloodFlag = false;

const useAutoFlood = (params: AutoFloodParams) => {
  const { autoRun, running, isIndoors, playerX, playerY, activeScreenIndex, equipment, inventoryItems, runRef, setOverlayMode } = params;
  const prevInventoryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAutoFlood() || didApplyAutoFloodFlag || running) return;
    didApplyAutoFloodFlag = true;
    setOverlayMode('auto');
    runRef.current?.();
  }, [activeScreenIndex, running, setOverlayMode, runRef]);

  useEffect(() => {
    if (!autoRun) return;
    setDeveloperToolsOverride(true);
    reassertFeatureFlags();
    return () => {
      setDeveloperToolsOverride(null);
      reassertFeatureFlags();
    };
  }, [autoRun]);

  useFloodOnTransition({
    enabled: autoRun,
    isIndoors,
    linkX: playerX,
    linkY: playerY,
    onTrigger: useCallback(() => { runRef.current?.(); }, [runRef]),
  });

  useEffect(() => {
    if (!autoRun || running) return;
    const key = inventoryKeyOf(equipment, inventoryItems);
    if (prevInventoryKeyRef.current !== null && prevInventoryKeyRef.current !== key) runRef.current?.();
    prevInventoryKeyRef.current = key;
  }, [autoRun, running, equipment, inventoryItems, runRef]);
};

export { useAutoFlood };
