/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { KeyedControlRow } from '../ControlRow';
import type { ControlContext } from '../settings-controls.type';
import type { ColorKey } from './hud.type';

const colorRow = (key: ColorKey, ctx: ControlContext): ReactNode => {
  const { settings, onChange, disabled } = ctx;
  const value = settings[key];
  const original = DEFAULT_SETTINGS[key];
  return (
    <KeyedControlRow
      settingKey={key}
      input={{ kind: 'color', value, onChange: (hex) => onChange({ [key]: hex }) }}
      disabled={disabled}
      changed={value.toLowerCase() !== original.toLowerCase()}
      onReset={() => onChange({ [key]: original })}
    />
  );
};

export { colorRow };
