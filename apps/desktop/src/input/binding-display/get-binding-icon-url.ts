/* @layer renderer-lib @kind logic */
import type { InputBinding, ButtonIcon } from '@rotp/game-data';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { keyCodeToIconId, AXIS_FALLBACK } from '@rotp/input-mapping';

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

export { getBindingIconUrl };
