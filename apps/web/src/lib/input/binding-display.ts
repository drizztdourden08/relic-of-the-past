/* @layer renderer-lib @kind logic */
/**
 * Resolves an InputBinding to a human label and an icon URL.
 * Shared by BindingRow (controls editor), the save-state hints, InputGlyph, and
 * the controller overlays so icon/label rendering has a single source of truth.
 */

import { SDL_AXIS } from '@shared/input/sdl-buttons';
import type { InputBinding, ButtonIcon, KeyboardBinding } from '@shared/types/controls';
import { getButtonIconUrl, keyCodeToIconId } from './button-icons';

/**
 * Where the icon chain ENDS. A bound control always draws a glyph: one row
 * falling back to bare text beside neighbours that have art reads as broken,
 * not as "this device is unplugged". The device-specific art is preferred and
 * arrives through `icon`, but it is absent whenever the pad is disconnected or
 * its family has no picture for that control. And an axis never carried a
 * stored icon at all, since its glyph depends on which end of the stick is
 * meant. So these generics are keyed off the binding's own shape, which is
 * always knowable, and only `none` may draw nothing.
 */
const AXIS_FALLBACK: Record<number, Record<'-' | '+', string>> = {
  [SDL_AXIS.LEFT_X]: { '-': 'generic-stick-left', '+': 'generic-stick-right' },
  [SDL_AXIS.RIGHT_X]: { '-': 'generic-stick-left', '+': 'generic-stick-right' },
  [SDL_AXIS.LEFT_Y]: { '-': 'generic-stick-up', '+': 'generic-stick-down' },
  [SDL_AXIS.RIGHT_Y]: { '-': 'generic-stick-up', '+': 'generic-stick-down' },
  [SDL_AXIS.LEFT_TRIGGER]: { '-': 'generic-trigger-a', '+': 'generic-trigger-a' },
  [SDL_AXIS.RIGHT_TRIGGER]: { '-': 'generic-trigger-b', '+': 'generic-trigger-b' },
};

const fallbackIconId = (binding: InputBinding): string | null => {
  if (binding.type === 'keyboard') return 'kb-any';
  if (binding.type === 'gamepad-button') return 'generic-btn';
  if (binding.type === 'gamepad-axis') {
    return AXIS_FALLBACK[binding.axisIndex]?.[binding.direction] ?? 'generic-stick';
  }
  return null;
};

const formatKeyCode = (code: string): string => {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const map: Record<string, string> = {
    ArrowUp: 'Arrow Up', ArrowDown: 'Arrow Down', ArrowLeft: 'Arrow Left', ArrowRight: 'Arrow Right',
    ShiftLeft: 'L.Shift', ShiftRight: 'R.Shift',
    ControlLeft: 'L.Ctrl', ControlRight: 'R.Ctrl',
    AltLeft: 'L.Alt', AltRight: 'R.Alt',
    Enter: 'Enter', Space: 'Space', Backspace: 'Bksp',
    Tab: 'Tab', Escape: 'Esc', CapsLock: 'Caps',
    PageUp: 'Page Up', PageDown: 'Page Down',
  };
  return map[code] ?? code;
};

const formatKeyBinding = (b: KeyboardBinding): string => {
  const parts: string[] = [];
  if (b.modifiers?.ctrl) parts.push('Ctrl');
  if (b.modifiers?.shift) parts.push('Shift');
  if (b.modifiers?.alt) parts.push('Alt');
  parts.push(b.label ?? formatKeyCode(b.code));
  return parts.join(' + ');
};

const getBindingLabel = (binding: InputBinding, icon?: ButtonIcon | null): string => {
  if (binding.type === 'none') return '-';
  if (icon?.label) return icon.label;
  switch (binding.type) {
    case 'keyboard':
      return formatKeyBinding(binding);
    case 'gamepad-button':
      return binding.label ?? `Button ${binding.index}`;
    case 'gamepad-axis':
      return binding.label ?? `Axis ${binding.axisIndex}${binding.direction}`;
  }
};

const getBindingIconUrl = (binding: InputBinding, icon?: ButtonIcon | null): string | null => {
  if (binding.type === 'none') return null;
  if (icon?.path) return icon.path;
  if (icon?.key) {
    const url = getButtonIconUrl(icon.key);
    if (url) return url;
  }
  if (binding.type === 'keyboard') {
    const iconId = keyCodeToIconId(binding.code);
    const url = iconId ? getButtonIconUrl(iconId) : null;
    if (url) return url;
  }
  const fallback = fallbackIconId(binding);
  return fallback ? getButtonIconUrl(fallback) : null;
};

export { formatKeyCode, formatKeyBinding, getBindingLabel, getBindingIconUrl };
