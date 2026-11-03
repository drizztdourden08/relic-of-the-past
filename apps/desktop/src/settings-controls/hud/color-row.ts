/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_SETTINGS } from '@rotp/game-core';
import { ColorRow } from './ColorRow';
import type { ControlContext } from '../settings-controls.type';
import type { ColorKey } from './hud.type';

const colorRow = (key: ColorKey, ctx: ControlContext): ReactNode => {
  const { settings, onChange, disabled } = ctx;
  return createElement(ColorRow, { settingKey: key, value: settings[key], original: DEFAULT_SETTINGS[key], onChange, disabled });
};

export { colorRow };
