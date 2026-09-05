/* @layer renderer-lib @kind logic */
/**
 * Resolves an InputBinding to a human label and an icon URL.
 * Shared by BindingRow (controls editor), the save-state hints, InputGlyph, and
 * the controller overlays so icon/label rendering has a single source of truth.
 */

import type { InputBinding, ButtonIcon, KeyboardBinding } from '@shared/types/controls';
import { getButtonIconUrl, keyCodeToIconId } from './button-icons';

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
    if (iconId) return getButtonIconUrl(iconId);
  }
  return null;
};

export { formatKeyCode, formatKeyBinding, getBindingLabel, getBindingIconUrl };
