/* @layer renderer-lib @kind logic */
import type { InputBinding, ButtonIcon } from '@rotp/game-data';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { AXIS_FALLBACK } from '@rotp/input-mapping';
import { iconKeyUrl } from './icon-key-url';
import { keyboardIconUrl } from './keyboard-icon-url';

const fallbackIconId = (binding: InputBinding): string | null => {
  if (binding.type === 'keyboard') return 'kb-any';
  if (binding.type === 'gamepad-button') return 'generic-btn';
  if (binding.type === 'gamepad-axis') {
    return AXIS_FALLBACK[binding.axisIndex]?.[binding.direction] ?? 'generic-stick';
  }
  return null;
};

const getBindingIconUrl = (binding: InputBinding, icon?: ButtonIcon | null): string | null => {
  if (binding.type === 'none') return null;
  if (icon?.path) return icon.path;
  const byKey = iconKeyUrl(icon);
  if (byKey) return byKey;
  const byKeyboard = keyboardIconUrl(binding);
  if (byKeyboard) return byKeyboard;
  const fallback = fallbackIconId(binding);
  return fallback ? getButtonIconUrl(fallback) : null;
};

export { getBindingIconUrl };
