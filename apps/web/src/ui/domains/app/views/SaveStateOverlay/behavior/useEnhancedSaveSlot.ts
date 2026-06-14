/* @layer renderer-components @kind hook */
/**
 * useEnhancedSaveSlot — state machine for the enhanced save slot shortcut flow.
 *
 * Flow:
 *  1. First press of ANY load/save key → opens overlay, highlights that slot.
 *  2. Press a DIFFERENT slot key while open → switches highlight to that slot.
 *  3. Press the SAME slot key a second time:
 *     - Quick tap (< TAP_THRESHOLD) → LOAD, close overlay.
 *     - Hold until bar fills (100%) then release → SAVE, close overlay.
 *     - Release midway (between tap and full hold) → cancel hold, stay on overlay.
 *  4. ESC → close overlay (cancel).
 *  5. If game is paused: unpause → action → re-pause (WASM can't save/load while paused).
 *
 * When disabled, function action callbacks fire immediately (original behavior).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getInputManager, saveState, loadState } from '../../../../../../lib/game';
import type { FunctionAction } from '@shared/types/controls';
import { log } from '../../../../../../lib/log-bus';
import { TAP_THRESHOLD_MS } from './enhanced-save-slot.types';
import type { EnhancedSaveSlotState, SlotHint } from './enhanced-save-slot.types';
import { withPauseGuard, buildIdleHints, buildHoldingHints } from './enhanced-save-slot.helpers';
import { useCancelOnOtherInput } from './enhanced-save-slot.cancel';

const useEnhancedSaveSlot = (
  enabled: boolean,
  holdDurationSec: number,
  gameRunning: boolean,
): EnhancedSaveSlotState => {
  const [open, setOpen] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [hints, setHints] = useState<SlotHint[]>([]);

  const pendingSlotRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdAnimRef = useRef<number | null>(null);
  const holdSlotRef = useRef<number | null>(null);
  const holdCompleteRef = useRef(false);
  const openRef = useRef(false);
  const awaitingHoldRef = useRef(false);

  const holdDurationMs = holdDurationSec * 1000;

  const close = useCallback(() => {
    setOpen(false);
    setHighlightedSlot(null);
    setHoldProgress(0);
    setHints([]);
    pendingSlotRef.current = null;
    holdStartRef.current = null;
    holdSlotRef.current = null;
    holdCompleteRef.current = false;
    openRef.current = false;
    awaitingHoldRef.current = false;
    if (holdAnimRef.current != null) {
      cancelAnimationFrame(holdAnimRef.current);
      holdAnimRef.current = null;
    }
  }, []);

  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (!gameRunning) close();
  }, [gameRunning, close]);

  // ESC key handler + any non-slot gamepad button cancels
  useCancelOnOtherInput(open, close);

  // Main subscription: slot actions + key-up handler
  useEffect(() => {
    if (!gameRunning) return;

    const inputMgr = getInputManager();
    const unsubs: (() => void)[] = [];
    const mappings = inputMgr.getFunctionMappings();

    const startHold = (slot: number) => {
      holdStartRef.current = performance.now();
      holdSlotRef.current = slot;
      holdCompleteRef.current = false;
      awaitingHoldRef.current = true;
      setHints(buildHoldingHints(mappings, slot));

      const tick = () => {
        if (holdStartRef.current == null) return;
        const elapsed = performance.now() - holdStartRef.current;
        const progress = Math.min(elapsed / holdDurationMs, 1);
        setHoldProgress(progress);

        if (progress >= 1) {
          holdCompleteRef.current = true;
          holdAnimRef.current = null;
          return;
        }
        holdAnimRef.current = requestAnimationFrame(tick);
      };
      holdAnimRef.current = requestAnimationFrame(tick);
    };

    const cancelHold = () => {
      holdStartRef.current = null;
      holdSlotRef.current = null;
      holdCompleteRef.current = false;
      awaitingHoldRef.current = false;
      if (holdAnimRef.current != null) {
        cancelAnimationFrame(holdAnimRef.current);
        holdAnimRef.current = null;
      }
      setHoldProgress(0);
    };

    const handleSlotAction = (slot: number) => {
      if (!enabled) return false;

      if (!openRef.current) {
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setHoldProgress(0);
        setHints(buildIdleHints(mappings, slot));
        setOpen(true);
        return true;
      }

      if (pendingSlotRef.current !== slot) {
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setHoldProgress(0);
        setHints(buildIdleHints(mappings, slot));
        return true;
      }

      startHold(slot);
      return true;
    };

    for (let i = 1; i <= 12; i++) {
      const slot = i - 1;

      unsubs.push(inputMgr.onFunctionAction(`load-state-${i}` as FunctionAction, () => {
        if (!enabled) {
          log.app(`[LoadState] Loading slot ${slot}`);
          withPauseGuard(() => loadState(slot));
          return;
        }
        handleSlotAction(slot);
      }));

      unsubs.push(inputMgr.onFunctionAction(`save-state-${i}` as FunctionAction, () => {
        if (!enabled) {
          log.app(`[SaveState] Saving slot ${slot}`);
          withPauseGuard(() => saveState(slot));
          return;
        }
        handleSlotAction(slot);
      }));
    }

    unsubs.push(inputMgr.onFunctionKeyUp((action: FunctionAction) => {
      if (!enabled || !openRef.current) return;
      if (!awaitingHoldRef.current) return;

      const loadMatch = action.match(/^load-state-(\d+)$/);
      const saveMatch = action.match(/^save-state-(\d+)$/);
      const match = loadMatch || saveMatch;
      if (!match) return;

      const slot = parseInt(match[1], 10) - 1;
      if (holdSlotRef.current !== slot) return;

      const elapsed = holdStartRef.current != null
        ? performance.now() - holdStartRef.current
        : holdCompleteRef.current ? holdDurationMs : 0;

      if (holdCompleteRef.current || elapsed >= holdDurationMs) {
        cancelHold();
        log.app(`[Enhanced] Save to slot ${slot}`);
        withPauseGuard(() => saveState(slot)).then(() => close());
      } else if (elapsed < TAP_THRESHOLD_MS) {
        cancelHold();
        log.app(`[Enhanced] Load from slot ${slot}`);
        withPauseGuard(() => loadState(slot)).then(() => close());
      } else {
        cancelHold();
        setHints(buildIdleHints(mappings, slot));
      }
    }));

    return () => {
      unsubs.forEach(u => u());
      cancelHold();
    };
  }, [gameRunning, enabled, holdDurationMs, close]);

  return {
    open,
    highlightedSlot,
    holdProgress,
    hints,
    close,
  };
}

export { useEnhancedSaveSlot };
export type { HintAction, SlotHint } from './enhanced-save-slot.types';
