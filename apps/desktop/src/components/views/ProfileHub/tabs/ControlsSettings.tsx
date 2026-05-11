import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../composites/SettingsLayout/SettingsLayout';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const KEYBOARD_CONTROLS = [
  ['D-Pad', 'Arrow Keys'],
  ['A (Action)', 'S'],
  ['B (Sword)', 'X'],
  ['X (Map)', 'A'],
  ['Y (Item)', 'Z'],
  ['L / R', 'D / C'],
  ['Start', 'Enter'],
  ['Select', 'Right Shift'],
];

const SECTIONS: Section[] = [
  {
    id: 'keyboard',
    title: 'Keyboard',
    subsections: [
      {
        id: 'keyboard-bindings',
        title: 'Bindings',
        items: [
          { key: '_keyboard', label: 'Keyboard Controls', description: 'Current key bindings for game controls', keywords: 'keyboard keys bindings remap' },
        ],
      },
    ],
  },
];

function renderControl(_key: string, _settings: GameSettings, _onChange: (patch: Partial<GameSettings>) => void): ReactNode | null {
  if (_key === '_keyboard') {
    return (
      <div className="controls-placeholder">
        <p className="controls-placeholder__text">Keybinding configuration coming soon.</p>
        <table className="controls-placeholder__table">
          <tbody>
            {KEYBOARD_CONTROLS.map(([action, key]) => (
              <tr key={action}><td>{action}</td><td>{key}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

export function ControlsSettings({ settings, onChange }: ControlsSettingsProps) {
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
    />
  );
}
