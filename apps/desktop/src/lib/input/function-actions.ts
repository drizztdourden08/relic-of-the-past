/* @layer renderer-lib @kind logic */
/**
 * Function Actions — manages shortcut/cheat key bindings and fires callbacks
 * on rising-edge detection from keyboard, gamepad, and HID sources.
 */

import type { FunctionMapping, FunctionAction } from '@shared/types/controls';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { webHidReader } from './hid-reader';

type FunctionKeyUpListener = (action: FunctionAction) => void;

/** Analog-stick deflection past this magnitude counts as a pressed direction. */
const AXIS_THRESHOLD = 0.5;

class FunctionActionEngine {
  private functionMappings: FunctionMapping[] = DEFAULT_FUNCTION_MAPPINGS;
  private functionKeyMap = new Map<string, FunctionAction>(); // "code:s:c:a" → action
  private functionGamepadButtonMap = new Map<number, FunctionAction>();
  private functionGamepadAxisMap = new Map<string, FunctionAction>(); // "axisIndex:direction" → action
  private functionActionCallbacks = new Map<FunctionAction, () => void>();
  private functionKeyUpListeners = new Set<FunctionKeyUpListener>();
  // Reverse lookup: code → funcKeyIds (for keyup matching without modifiers)
  private functionCodeToKeyIds = new Map<string, string[]>();
  // Track which function-mapped gamepad buttons are currently held (for key-up detection)
  private heldFunctionGamepadButtons = new Set<string>(); // "deviceKey:index" or "deviceKey:axis:idx:dir"

  // External callback for pause toggle (wired by InputManager)
  onPauseToggle: (() => void) | null = null;

  constructor() {
    this.rebuild();
  }

  get hasMappedGamepadButtons(): boolean {
    return this.functionGamepadButtonMap.size > 0 || this.functionGamepadAxisMap.size > 0;
  }

  setMappings(mappings: FunctionMapping[]): void {
    this.functionMappings = mappings;
    this.rebuild();
  }

  getMappings(): FunctionMapping[] {
    return this.functionMappings;
  }

  onAction(action: FunctionAction, callback: () => void): () => void {
    this.functionActionCallbacks.set(action, callback);
    return () => this.functionActionCallbacks.delete(action);
  }

  onKeyUp(listener: FunctionKeyUpListener): () => void {
    this.functionKeyUpListeners.add(listener);
    return () => this.functionKeyUpListeners.delete(listener);
  }

  clearHeld(): void {
    this.heldFunctionGamepadButtons.clear();
  }

  /**
   * Check a keyboard keydown event for function action matches.
   * Returns true if matched (caller should preventDefault).
   */
  handleKeyDown(code: string, shiftKey: boolean, ctrlKey: boolean, altKey: boolean): boolean {
    const funcKeyId = this.makeFunctionKeyId(code, { shift: shiftKey, ctrl: ctrlKey, alt: altKey });
    const funcAction = this.functionKeyMap.get(funcKeyId);
    if (funcAction) {
      this.fireAction(funcAction);
      return true;
    }
    return false;
  }

  /**
   * Fire key-up listeners for a given keyboard code.
   */
  handleKeyUp(code: string): void {
    const funcKeyIds = this.functionCodeToKeyIds.get(code);
    if (funcKeyIds && this.functionKeyUpListeners.size > 0) {
      for (const fkid of funcKeyIds) {
        const funcAction = this.functionKeyMap.get(fkid);
        if (funcAction) {
          for (const fn of this.functionKeyUpListeners) {
            try { fn(funcAction); } catch { /* ignore */ }
          }
        }
      }
    }
  }

  /**
   * Check gamepad/HID buttons against function mappings each frame.
   * Fires callbacks on rising edge, fires keyUp listeners on falling edge.
   */
  checkGamepads(hidStates: Map<string, { buttons: boolean[]; axes: number[] }>): void {
    // --- Web Gamepad API controllers (skip those handled by node-hid) ---
    const gamepads = navigator.getGamepads();
    const hidIds = new Set(webHidReader.getConnectedDeviceKeys());

    for (const gp of gamepads) {
      if (!gp || !gp.connected) continue;
      // Skip gamepads already handled by WebHID
      const gpIdLower = gp.id.toLowerCase();
      let isDuplicate = false;
      for (const hidId of hidIds) {
        const [vid, pid] = hidId.split(':');
        if (gpIdLower.includes(`vendor: ${vid}`) && gpIdLower.includes(`product: ${pid}`)) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;

      // Normalize Web Gamepad buttons (objects) to booleans, then share one code path.
      this.processDeviceState(`gamepad-${gp.index}`, gp.buttons.map((b) => b.pressed), gp.axes);
    }

    // --- WebHID controllers (Switch Pro, PlayStation, 8BitDo) ---
    for (const [deviceKey, state] of hidStates) {
      this.processDeviceState(deviceKey, state.buttons, state.axes);
    }
  }

  // ─── Private ───

  /** Run rising/falling-edge detection over one device's buttons + axes. */
  private processDeviceState(deviceKey: string, buttons: readonly boolean[], axes: readonly number[]): void {
    for (const [btnIndex, action] of this.functionGamepadButtonMap) {
      if (btnIndex >= buttons.length) continue;
      this.edge(buttons[btnIndex], `${deviceKey}:btn:${btnIndex}`, action);
    }
    for (const [axisKey, action] of this.functionGamepadAxisMap) {
      const [axisStr, dir] = axisKey.split(':');
      const axisIndex = parseInt(axisStr, 10);
      if (axisIndex >= axes.length) continue;
      const val = axes[axisIndex];
      const active = (dir === '+' && val > AXIS_THRESHOLD) || (dir === '-' && val < -AXIS_THRESHOLD);
      this.edge(active, `${deviceKey}:axis:${axisKey}`, action);
    }
  }

  /** Fire the action on a rising edge, the key-up listeners on a falling edge. */
  private edge(active: boolean, holdKey: string, action: FunctionAction): void {
    if (active && !this.heldFunctionGamepadButtons.has(holdKey)) {
      this.heldFunctionGamepadButtons.add(holdKey);
      this.fireAction(action);
    } else if (!active && this.heldFunctionGamepadButtons.has(holdKey)) {
      this.heldFunctionGamepadButtons.delete(holdKey);
      this.fireKeyUp(action);
    }
  }

  private rebuild(): void {
    this.functionKeyMap.clear();
    this.functionCodeToKeyIds.clear();
    this.functionGamepadButtonMap.clear();
    this.functionGamepadAxisMap.clear();
    for (const m of this.functionMappings) {
      if (m.binding.type === 'keyboard') {
        const key = this.makeFunctionKeyId(m.binding.code, m.binding.modifiers);
        this.functionKeyMap.set(key, m.action);
        const list = this.functionCodeToKeyIds.get(m.binding.code) ?? [];
        list.push(key);
        this.functionCodeToKeyIds.set(m.binding.code, list);
      } else if (m.binding.type === 'gamepad-button') {
        this.functionGamepadButtonMap.set(m.binding.index, m.action);
      } else if (m.binding.type === 'gamepad-axis') {
        this.functionGamepadAxisMap.set(`${m.binding.axisIndex}:${m.binding.direction}`, m.action);
      }
    }
  }

  private makeFunctionKeyId(code: string, modifiers?: { shift?: boolean; ctrl?: boolean; alt?: boolean }): string {
    return `${code}:${modifiers?.shift ? 1 : 0}:${modifiers?.ctrl ? 1 : 0}:${modifiers?.alt ? 1 : 0}`;
  }

  private fireAction(action: FunctionAction): void {
    if (action === 'pause') {
      this.onPauseToggle?.();
      return;
    }
    const cb = this.functionActionCallbacks.get(action);
    if (cb) cb();
  }

  private fireKeyUp(action: FunctionAction): void {
    for (const fn of this.functionKeyUpListeners) {
      try { fn(action); } catch { /* ignore */ }
    }
  }
}

export { FunctionActionEngine };
export type { FunctionKeyUpListener };
