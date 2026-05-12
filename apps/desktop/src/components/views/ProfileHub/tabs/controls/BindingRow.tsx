/**
 * BindingRow — a single SNES button mapping row.
 * Shows: icon slot | SNES label | current binding label | rebind button
 *
 * Icon slot reserves fixed space even when icon is null — no layout shift.
 */

import type { ButtonMapping } from '@shared/types/controls';
import { SNES_BUTTON_LABELS } from '@shared/types/controls';
import './BindingRow.css';

interface BindingRowProps {
  mapping: ButtonMapping;
  onRebind: (mapping: ButtonMapping) => void;
}

function getBindingLabel(mapping: ButtonMapping): string {
  const b = mapping.binding;
  switch (b.type) {
    case 'keyboard':
      return b.label ?? formatKeyCode(b.code);
    case 'gamepad-button':
      return b.label ?? `Btn ${b.index}`;
    case 'gamepad-axis':
      return b.label ?? `Axis ${b.axisIndex}${b.direction}`;
  }
}

function formatKeyCode(code: string): string {
  // Strip "Key" prefix: "KeyZ" → "Z"
  if (code.startsWith('Key')) return code.slice(3);
  // Strip "Digit" prefix: "Digit1" → "1"
  if (code.startsWith('Digit')) return code.slice(5);
  // Common mappings
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

export function BindingRow({ mapping, onRebind }: BindingRowProps): JSX.Element {
  const label = SNES_BUTTON_LABELS[mapping.snesButton];
  const bindingLabel = getBindingLabel(mapping);
  const icon = mapping.icon;

  return (
    <div className="binding-row">
      <div className="binding-row__icon-slot">
        {icon ? (
          icon.path ? (
            <img src={icon.path} alt={icon.label} className="binding-row__icon-img" />
          ) : (
            <span className="binding-row__icon-text">{icon.label}</span>
          )
        ) : null}
      </div>
      <span className="binding-row__snes-label">{label}</span>
      <span className="binding-row__binding-label">{bindingLabel}</span>
      <button
        className="binding-row__rebind-btn"
        title={`Rebind ${label}`}
        onClick={() => onRebind(mapping)}
      >
        ⟳
      </button>
    </div>
  );
}
