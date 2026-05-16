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
import { getInputManager, saveState, loadState, resolveFunctionMappingIcon } from '../../../lib/game';
import type { FunctionAction, FunctionMapping } from '@shared/types/controls';
import { getBindingLabel, getBindingIconUrl } from '../../views/ProfileHub/tabs/controls/BindingRow';
import { keyCodeToIconId, getButtonIconUrl } from '../../views/InputTester/button-icons';
import { log } from '../../../lib/log-bus';

/** Time in ms below which a second press is considered a "tap" → LOAD */
const TAP_THRESHOLD_MS = 180;

export type HintAction = 'tap-load' | 'hold-save' | 'esc-cancel' | 'holding-save';

export interface SlotHint {
  action: HintAction;
  keyLabel: string;        // text fallback (e.g. "F1", "Shift+F1", "Esc")
  iconUrl: string | null;  // SVG icon URL from button-icons system
}

interface EnhancedSaveSlotState {
  open: boolean;
  highlightedSlot: number | null;
  holdProgress: number;
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
    // Let one frame run so WASM is unpaused before the action
    await new Promise(r => requestAnimationFrame(r));
  }
  const result = await action();
  if (wasPaused) {
    // Let at least one frame render so the screen updates after a load,
    // then re-pause. Two rAFs: one for WASM to process, one to paint.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    inputMgr.togglePause();
  }
  return result;
}

/** Look up the binding for a slot's load action from function mappings */
function getSlotBinding(mappings: FunctionMapping[], slot: number): { label: string; iconUrl: string | null } {
  // Prefer load binding (that's what you press first)
  const loadAction = `load-state-${slot + 1}` as FunctionAction;
  const loadMapping = mappings.find(m => m.action === loadAction && m.binding.type !== 'none');
  if (loadMapping) {
    const icon = loadMapping.icon ?? resolveFunctionMappingIcon(loadMapping);
    return {
      label: getBindingLabel(loadMapping.binding, icon),
      iconUrl: getBindingIconUrl(loadMapping.binding, icon),
    };
  }
  // Fallback to save binding
  const saveAction = `save-state-${slot + 1}` as FunctionAction;
  const saveMapping = mappings.find(m => m.action === saveAction && m.binding.type !== 'none');
  if (saveMapping) {
    const icon = saveMapping.icon ?? resolveFunctionMappingIcon(saveMapping);
    return {
      label: getBindingLabel(saveMapping.binding, icon),
      iconUrl: getBindingIconUrl(saveMapping.binding, icon),
    };
  }
  return { label: `Slot ${slot + 1}`, iconUrl: null };
}

/** Get ESC key icon */
function getEscBinding(): { label: string; iconUrl: string | null } {
  const iconId = keyCodeToIconId('Escape');
  return {
    label: 'Esc',
    iconUrl: iconId ? getButtonIconUrl(iconId) : null,
  };
}

export function useEnhancedSaveSlot(
  enabled: boolean,
  holdDurationSec: number,
  gameRunning: boolean,
): EnhancedSaveSlotState {
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
  useEffect(() => {
    if (!open) return;
    const inputMgr = getInputManager();

    // Keyboard: ESC or any non-slot-mapped key cancels
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      // Check if this key is mapped to a save/load slot — if not, cancel
      const mappings = inputMgr.getFunctionMappings();
      const isSlotKey = mappings.some(m =>
        m.binding.type === 'keyboard' &&
        m.binding.code === e.code &&
        (m.action.startsWith('load-state-') || m.action.startsWith('save-state-'))
      );
      if (!isSlotKey) {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Gamepad: any button NOT mapped to a save/load slot cancels
    const mappings = inputMgr.getFunctionMappings();
    const slotButtonIndices = new Set<number>();
    for (const m of mappings) {
      if (m.binding.type === 'gamepad-button' && (m.action.startsWith('load-state-') || m.action.startsWith('save-state-'))) {
        slotButtonIndices.add(m.binding.index);
      }
    }

    // Track previous button states to detect rising edges
    const prevButtons = new Map<string, boolean[]>();
    const unsub = inputMgr.onInputState((hidStates, gamepads) => {
      // Check WebHID controllers
      for (const [key, state] of hidStates) {
        const prev = prevButtons.get(key) ?? [];
        for (let i = 0; i < state.buttons.length; i++) {
          if (state.buttons[i] && !prev[i] && !slotButtonIndices.has(i)) {
            close();
            return;
          }
        }
        prevButtons.set(key, [...state.buttons]);
      }
      // Check standard gamepads
      for (const gp of gamepads) {
        const gpKey = `gp-${gp.index}`;
        const prev = prevButtons.get(gpKey) ?? [];
        for (let i = 0; i < gp.buttons.length; i++) {
          if (gp.buttons[i].pressed && !prev[i] && !slotButtonIndices.has(i)) {
            close();
            return;
          }
        }
        prevButtons.set(gpKey, gp.buttons.map(b => b.pressed));
      }
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      unsub();
    };
  }, [open, close]);

  useEffect(() => {
    if (!gameRunning) return;

    const inputMgr = getInputManager();
    const unsubs: (() => void)[] = [];
    const mappings = inputMgr.getFunctionMappings();
    const escInfo = getEscBinding();

    /** Build idle hints from actual bindings */
    const idleHints = (slot: number): SlotHint[] => {
      const slotInfo = getSlotBinding(mappings, slot);
      return [
        { action: 'tap-load', keyLabel: slotInfo.label, iconUrl: slotInfo.iconUrl },
        { action: 'hold-save', keyLabel: slotInfo.label, iconUrl: slotInfo.iconUrl },
        { action: 'esc-cancel', keyLabel: escInfo.label, iconUrl: escInfo.iconUrl },
      ];
    };

    /** Hints while holding */
    const holdingHints = (slot: number): SlotHint[] => {
      const slotInfo = getSlotBinding(mappings, slot);
      return [
        { action: 'holding-save', keyLabel: slotInfo.label, iconUrl: slotInfo.iconUrl },
      ];
    };

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
        setHints(idleHints(slot));
        setOpen(true);
        return true;
      }

      if (pendingSlotRef.current !== slot) {
        cancelHold();
        pendingSlotRef.current = slot;
        setHighlightedSlot(slot);
        setHoldProgress(0);
        setHints(idleHints(slot));
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
