/**
 * BindingRow — a single SNES button mapping row.
 * Shows: SNES button name | SNES icon | controller icon | controller button name
 * Entire row is clickable to initiate rebinding.
 */

import type { ButtonMapping } from '@shared/types/controls';
import { SNES_BUTTON_LABELS } from '@shared/types/controls';
import { getSnesIconUrl, getButtonIconUrl, keyCodeToIconId } from '../../../InputTester/button-icons';
import './BindingRow.css';

interface BindingRowProps {
  mapping: ButtonMapping;
  onRebind: (mapping: ButtonMapping) => void;
}

function getBindingLabel(mapping: ButtonMapping): string {
  // Prefer the icon label (e.g. "A", "LB", "Menu") which comes from the preset
  if (mapping.icon?.label) return mapping.icon.label;
  const b = mapping.binding;
  switch (b.type) {
    case 'keyboard':
      return b.label ?? formatKeyCode(b.code);
    case 'gamepad-button':
      return b.label ?? `Button ${b.index}`;
    case 'gamepad-axis':
      return b.label ?? `Axis ${b.axisIndex}${b.direction}`;
  }
}

function formatKeyCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const map: Record<string, string> = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    ShiftLeft: 'L.Shift', ShiftRight: 'R.Shift',
    ControlLeft: 'L.Ctrl', ControlRight: 'R.Ctrl',
    AltLeft: 'L.Alt', AltRight: 'R.Alt',
    Enter: 'Enter', Space: 'Space', Backspace: 'Bksp',
    Tab: 'Tab', Escape: 'Esc', CapsLock: 'Caps',
  };
  return map[code] ?? code;
}

/** Resolve the binding-side icon path from the mapping's icon or keyboard code */
function getBindingIconUrl(mapping: ButtonMapping): string | null {
  // If the mapping already has an icon with a path, use it
  if (mapping.icon?.path) return mapping.icon.path;
  // If the mapping has an icon key, look it up
  if (mapping.icon?.key) {
    const url = getButtonIconUrl(mapping.icon.key);
    if (url) return url;
  }
  // For keyboard bindings, derive from the key code
  if (mapping.binding.type === 'keyboard') {
    const iconId = keyCodeToIconId(mapping.binding.code);
    if (iconId) return getButtonIconUrl(iconId);
  }
  return null;
}

export function BindingRow({ mapping, onRebind }: BindingRowProps): JSX.Element {
  const snesLabel = SNES_BUTTON_LABELS[mapping.snesButton];
  const snesIconUrl = getSnesIconUrl(mapping.snesButton);
  const bindingLabel = getBindingLabel(mapping);
  const bindingIconUrl = getBindingIconUrl(mapping);

  return (
    <div
      className="binding-row"
      role="button"
      tabIndex={0}
      title={`Click to rebind ${snesLabel}`}
      onClick={() => onRebind(mapping)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRebind(mapping); } }}
    >
      {/* SNES button name */}
      <span className="binding-row__snes-label">{snesLabel}</span>

      {/* SNES button icon */}
      <div className="binding-row__icon-slot">
        {snesIconUrl ? (
          <img src={snesIconUrl} alt={snesLabel} className="binding-row__icon-img" />
        ) : null}
      </div>

      {/* Bound controller/keyboard icon */}
      <div className="binding-row__icon-slot">
        {bindingIconUrl ? (
          <img src={bindingIconUrl} alt={bindingLabel} className="binding-row__icon-img" />
        ) : null}
      </div>

      {/* Bound button name */}
      <span className="binding-row__binding-label">{bindingLabel}</span>
    </div>
  );
}
