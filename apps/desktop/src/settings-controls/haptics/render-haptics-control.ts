/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { SettingsInput } from '@drizztdourden08/tessera/composites';
import type { HapticSettings } from '@rotp/features';
import { KeyedControlRow } from '../KeyedControlRow';
import { hapticPatch } from './haptic-patch';
import type { ControlContext } from '../settings-controls.type';

const prefix = 'haptics.';

const percent = (value: number): string => `${value}%`;

const hapticInput = (field: keyof HapticSettings, ctx: ControlContext): SettingsInput => {
  const { settings, onChange } = ctx;
  const value = settings.haptics[field];
  if (typeof value === 'number') {
    return { kind: 'slider', value, min: 10, max: 100, step: 5, formatValue: percent, onChange: (next) => onChange(hapticPatch(settings, field, next)) };
  }
  return { kind: 'toggle', value, onChange: (next) => onChange(hapticPatch(settings, field, next)) };
};

const renderHapticsControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (!key.startsWith(prefix)) return null;
  const field = key.slice(prefix.length) as keyof HapticSettings;
  return createElement(KeyedControlRow, { settingKey: key, input: hapticInput(field, ctx), disabled: ctx.disabled });
};

export { renderHapticsControl };
