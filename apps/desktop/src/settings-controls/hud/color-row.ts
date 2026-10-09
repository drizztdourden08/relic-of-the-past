/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_SETTINGS } from '@rotp/game-core';
import { KeyedControlRow } from '../KeyedControlRow';
import type { ControlContext } from '../settings-controls.type';
import type { ColorKey } from './hud.type';

const colorRow = (key: ColorKey, ctx: ControlContext): ReactNode => {
  const { settings, onChange, disabled } = ctx;
  const value = settings[key];
  const original = DEFAULT_SETTINGS[key];
  return createElement(KeyedControlRow, {
    settingKey: key,
    input: { kind: 'color', value, onChange: (hex: string) => onChange({ [key]: hex }) },
    disabled,
    changed: value.toLowerCase() !== original.toLowerCase(),
    onReset: () => onChange({ [key]: original }),
  });
};

export { colorRow };
