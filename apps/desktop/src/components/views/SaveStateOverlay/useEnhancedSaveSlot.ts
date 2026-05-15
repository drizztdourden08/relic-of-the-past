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
import { getInputManager, saveState, loadState } from '../../../lib/game';
import type { FunctionAction } from '@shared/types/controls';
import { log } from '../../../lib/log-bus';

/** Time in ms below which a second press is considered a "tap" → LOAD */
const TAP_THRESHOLD_MS = 180;

export type HintAction = 'tap-load' | 'hold-save' | 'esc-cancel' | 'holding-save';

export interface SlotHint {
  action: HintAction;
  keyLabel: string; // e.g. "F1", "Esc"
}

interface EnhancedSaveSlotState {
  open: boolean;
  highlightedSlot: number | null;
  holdProgress: number;
  /** Contextual hints positioned under the active slot */
  hints: SlotHint[];
  close: () => void;
}

/**
 * Wrap a save/load action with pause handling: if game is paused, unpause first,
 * do the action, then re-pause.
 */
async function withPauseGuard(action: () => Promise<boolean>): Promise<boolean> {
  const inputMgr = getInputManager();
  const wasPaused = inputMgr.isPaused();
  if (wasPaused) {
    inputMgr.resume();
    // Give one frame for WASM to unpause
    await new Promise(r => requestAnimationFrame(r));
  }
  const result = await action();
  if (wasPaused) {
    inputMgr.togglePause();
  }
  return result;
}

/** Slot index (0-11) → display key label */
const SLOT_KEY_LABELS = ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];

export function useEnhancedSaveSlot(
  enabled: boolean,
  holdDurationSec: number,
  gameRunning: boolean,
): EnhancedSaveSlotState {
  const [open, setOpen] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [hints, setHints] = useState<SlotHint[]>([]);

  // Refs for the state machine
  const pendingSlotRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdAnimRef = useRef<number | null>(null);
  const holdSlotRef = useRef<number | null>(null);
  const holdCompleteRef = useRef(false); // bar reached 100%
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

  // ESC key handler
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, close]);

  useEffect(() => {
    if (!gameRunning) return;

    const inputMgr = getInputManager();
    const unsubs: (() => void)[] = [];

    /** Build idle hints (overlay open, waiting for second press) */
    const idleHints = (slot: number): SlotHint[] => [
      { action: 'tap-load', keyLabel: SLOT_KEY_LABELS[slot] },
      { action: 'hold-save', keyLabel: SLOT_KEY_LABELS[slot] },
      { action: 'esc-cancel', keyLabel: 'Esc' },
    ];

    /** Hints while holding */
    const holdingHints = (slot: number): SlotHint[] => [
      { action: 'holding-save', keyLabel: SLOT_KEY_LABELS[slot] },
    ];

    // --- Helper: start hold-to-save animation on second press ---
    const startHold = (slot: number) => {
      holdStartRef.current = performance.now();
      holdSlotRef.current = slot;
      holdCompleteRef.current = false;
      awaitingHoldRef.current = true;
      setHints(holdingHints(slot));

      const tick = () => {
        if (holdStartRef.current == null) return;
        const elapsed = performance.now() - holdStartRef.current;
        const progress = Math.min(elapsed / holdDurationMs, 1);
        setHoldProgress(progress);

        if (progress >= 1) {
          // Bar full — DON'T save yet, wait for release
          holdCompleteRef.current = true;
          holdAnimRef.current = null;
          return;
        }
        holdAnimRef.current = requestAnimationFrame(tick);
      };
      holdAnimRef.current = requestAnimationFrame(tick);
    };

    // --- Helper: cancel hold animation ---
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

    // --- Slot action handler (shared by load and save keys) ---
    const handleSlotAction = (slot: number) => {
      if (!enabled) return false;

      if (!openRef.current) {
        // FIRST PRESS: open overlay, highlight slot
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setHoldProgress(0);
        setHints(idleHints(slot));
        setOpen(true);
        return true;
      }

      // Overlay is open
      if (pendingSlotRef.current !== slot) {
        // DIFFERENT SLOT: switch highlight
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setHoldProgress(0);
        setHints(idleHints(slot));
        return true;
      }

      // SAME SLOT, SECOND PRESS: start hold detection
      startHold(slot);
      return true;
    };

    // --- Register function action callbacks ---
    for (let i = 1; i <= 12; i++) {
      const slot = i - 1;

      // LOAD action (e.g. F1-F4)
      unsubs.push(inputMgr.onFunctionAction(`load-state-${i}` as FunctionAction, () => {
        if (!enabled) {
          log.app(`[LoadState] Loading slot ${slot}`);
          withPauseGuard(() => loadState(slot));
          return;
        }
        handleSlotAction(slot);
      }));

      // SAVE action (e.g. Shift+F1-F4) — in enhanced mode, behaves identically
      unsubs.push(inputMgr.onFunctionAction(`save-state-${i}` as FunctionAction, () => {
        if (!enabled) {
          log.app(`[SaveState] Saving slot ${slot}`);
          withPauseGuard(() => saveState(slot));
          return;
        }
        handleSlotAction(slot);
      }));
    }

    // --- Key-up handler: determines action based on hold duration ---
    unsubs.push(inputMgr.onFunctionKeyUp((action: FunctionAction) => {
      if (!enabled || !openRef.current) return;
      if (!awaitingHoldRef.current) return;

      // Match both load-state-N and save-state-N
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
        // HELD LONG ENOUGH → SAVE on release
        cancelHold();
        log.app(`[Enhanced] Save to slot ${slot}`);
        withPauseGuard(() => saveState(slot)).then(() => close());
      } else if (elapsed < TAP_THRESHOLD_MS) {
        // QUICK TAP → LOAD
        cancelHold();
        log.app(`[Enhanced] Load from slot ${slot}`);
        withPauseGuard(() => loadState(slot)).then(() => close());
      } else {
        // RELEASED MIDWAY → cancel, stay on overlay
        cancelHold();
        setHints(idleHints(slot));
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
