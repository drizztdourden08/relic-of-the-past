/**
 * useEnhancedSaveSlot — state machine for the enhanced save slot shortcut flow.
 *
 * When a save/load shortcut key is pressed:
 *  1. Opens the save state overlay with the target slot highlighted
 *  2. Shows "Press again to load" message
 *  3. Pressing the same load key again → executes load, closes overlay
 *  4. Holding the save key → fills the slot card progressively, saves on completion
 *  5. Releasing the save key before threshold → cancels save
 *  6. Clicking backdrop or pressing a different key → closes overlay
 *
 * When disabled, function action callbacks fire immediately (original behavior).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getInputManager, saveState, loadState } from '../../../lib/game';
import type { FunctionAction } from '@shared/types/controls';
import { log } from '../../../lib/log-bus';

interface EnhancedSaveSlotState {
  /** Whether the overlay should be open */
  open: boolean;
  /** Which slot (0-11) is highlighted, or null */
  highlightedSlot: number | null;
  /** Hold-to-save fill progress 0-1 */
  holdProgress: number;
  /** Status message shown below the overlay */
  statusMessage: string | null;
  /** Close the overlay */
  close: () => void;
}

export function useEnhancedSaveSlot(
  enabled: boolean,
  holdDurationSec: number,
  gameRunning: boolean,
): EnhancedSaveSlotState {
  const [open, setOpen] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Refs for the state machine
  const pendingSlotRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdAnimRef = useRef<number | null>(null);
  const holdSlotRef = useRef<number | null>(null);
  const savedRef = useRef(false); // prevent load trigger after save completes
  const openRef = useRef(false);

  const holdDurationMs = holdDurationSec * 1000;

  const close = useCallback(() => {
    setOpen(false);
    setHighlightedSlot(null);
    setHoldProgress(0);
    setStatusMessage(null);
    pendingSlotRef.current = null;
    holdStartRef.current = null;
    holdSlotRef.current = null;
    savedRef.current = false;
    openRef.current = false;
    if (holdAnimRef.current != null) {
      cancelAnimationFrame(holdAnimRef.current);
      holdAnimRef.current = null;
    }
  }, []);

  // Keep openRef in sync
  useEffect(() => { openRef.current = open; }, [open]);

  // Close when game stops
  useEffect(() => {
    if (!gameRunning) close();
  }, [gameRunning, close]);

  useEffect(() => {
    if (!gameRunning) return;

    const inputMgr = getInputManager();
    const unsubs: (() => void)[] = [];

    // --- Helper: start hold-to-save animation ---
    const startHold = (slot: number) => {
      holdStartRef.current = performance.now();
      holdSlotRef.current = slot;
      savedRef.current = false;

      const tick = () => {
        if (holdStartRef.current == null) return;
        const elapsed = performance.now() - holdStartRef.current;
        const progress = Math.min(elapsed / holdDurationMs, 1);
        setHoldProgress(progress);

        if (progress >= 1) {
          // Save completed!
          savedRef.current = true;
          holdStartRef.current = null;
          holdAnimRef.current = null;
          log.app(`[Enhanced] Save to slot ${slot}`);
          saveState(slot).then(() => {
            close();
          });
          return;
        }
        holdAnimRef.current = requestAnimationFrame(tick);
      };
      holdAnimRef.current = requestAnimationFrame(tick);
      setStatusMessage(`Hold to save slot ${slot + 1}...`);
    };

    // --- Helper: cancel hold ---
    const cancelHold = () => {
      holdStartRef.current = null;
      holdSlotRef.current = null;
      if (holdAnimRef.current != null) {
        cancelAnimationFrame(holdAnimRef.current);
        holdAnimRef.current = null;
      }
      setHoldProgress(0);
    };

    // --- Register function action callbacks ---
    for (let i = 1; i <= 12; i++) {
      const slot = i - 1;

      // LOAD action (e.g. F1-F4)
      unsubs.push(inputMgr.onFunctionAction(`load-state-${i}` as FunctionAction, () => {
        if (!enabled) {
          // Direct mode — load immediately
          log.app(`[LoadState] Loading slot ${slot}`);
          loadState(slot);
          return;
        }

        if (openRef.current && pendingSlotRef.current === slot) {
          // Second press on same slot → execute load
          log.app(`[Enhanced] Load from slot ${slot}`);
          loadState(slot).then(() => close());
          return;
        }

        // First press → open overlay, highlight slot
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setHoldProgress(0);
        setStatusMessage(`Press again to load slot ${slot + 1}`);
        setOpen(true);
      }));

      // SAVE action (e.g. Shift+F1-F4)
      unsubs.push(inputMgr.onFunctionAction(`save-state-${i}` as FunctionAction, () => {
        if (!enabled) {
          // Direct mode — save immediately
          log.app(`[SaveState] Saving slot ${slot}`);
          saveState(slot);
          return;
        }

        if (openRef.current && pendingSlotRef.current === slot && holdStartRef.current != null) {
          // Already holding — ignore repeat keydown
          return;
        }

        // Open overlay and start hold-to-save
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setOpen(true);
        startHold(slot);
      }));
    }

    // --- Key-up handler: cancel hold if save key is released before threshold ---
    unsubs.push(inputMgr.onFunctionKeyUp((action: FunctionAction) => {
      if (!enabled || !openRef.current) return;

      const match = action.match(/^save-state-(\d+)$/);
      if (match) {
        const slot = parseInt(match[1], 10) - 1;
        if (holdSlotRef.current === slot && !savedRef.current) {
          // Released before threshold — cancel save, but keep overlay open
          cancelHold();
          setStatusMessage(`Press again to load slot ${slot + 1}`);
        }
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
    statusMessage,
    close,
  };
}
