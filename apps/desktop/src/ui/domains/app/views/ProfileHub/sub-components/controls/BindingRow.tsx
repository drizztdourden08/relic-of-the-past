/* @layer renderer-components @kind component */
/**
 * BindingRow — a single input mapping row (SNES buttons, shortcuts, cheats).
 * Shows: action label | optional middle icon | optional middle label | binding icon | binding label
 * Entire row is clickable to initiate rebinding.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import type { InputBinding, ButtonIcon, KeyboardBinding } from '@shared/types/controls';
import { getButtonIconUrl, keyCodeToIconId } from '@app/lib/input/button-icons';
import './BindingRow.css';

interface BindingRowProps {
  actionLabel: string;
  middleLabel?: string;
  middleIconUrl?: string | null;
  binding: InputBinding;
  bindingIcon?: ButtonIcon | null;
  onRebind: () => void;
  onClear?: () => void;
}

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
  if (binding.type === 'none') return '—';
  if (icon?.label) return icon.label;
  switch (binding.type) {
    case 'keyboard':
      return formatKeyBinding(binding);
    case 'gamepad-button':
      return binding.label ?? `Button ${binding.index}`;
    case 'gamepad-axis':
      return binding.label ?? `Axis ${binding.axisIndex}${binding.direction}`;
  }
}

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
}

const BindingRow = (props: BindingRowProps) => {
  const { actionLabel, middleLabel, middleIconUrl, binding, bindingIcon, onRebind, onClear } = props;
  const bindingLabel = getBindingLabel(binding, bindingIcon);
  const bindingIconSrc = getBindingIconUrl(binding, bindingIcon);
  const isNone = binding.type === 'none';

  return (
    <Box
      className="binding-row"
      role="button"
      tabIndex={0}
      title={`Click to rebind ${actionLabel}`}
      onClick={onRebind}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRebind(); } }}
    >
      {/* Action name */}
      <Text className="binding-row__action-label">{actionLabel}</Text>

      {/* Middle icon (e.g. SNES button icon) */}
      <Box className="binding-row__icon-slot">
        {middleIconUrl ? (
          <Image src={middleIconUrl} alt={middleLabel ?? ''} className="binding-row__icon-img" />
        ) : null}
      </Box>

      {/* Middle label (e.g. SNES button name) */}
      <Text className="binding-row__snes-label">{middleLabel ?? ''}</Text>

      {/* Bound input icon */}
      <Box className="binding-row__icon-slot">
        {bindingIconSrc ? (
          <Image src={bindingIconSrc} alt={bindingLabel} className="binding-row__icon-img" />
        ) : null}
      </Box>

      {/* Bound input label */}
      <Text className={`binding-row__binding-label ${isNone ? 'binding-row__binding-label--none' : ''}`}>{bindingLabel}</Text>

      {/* Clear button */}
      {onClear && !isNone && (
        <Box
          as="button"
          className="binding-row__clear"
          title="Clear binding"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
        >
          ✕
        </Box>
      )}
    </Box>
  );
}

export { BindingRow, getBindingIconUrl, getBindingLabel };
