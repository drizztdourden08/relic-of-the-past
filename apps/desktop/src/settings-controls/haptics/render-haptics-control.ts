/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { HapticSettings } from '@rotp/features';
import { SliderControl, ToggleControl } from '../inputs';
import { hapticPatch } from './haptic-patch';
import type { ControlContext } from '../settings-controls.type';

const prefix = 'haptics.';

const percent = (value: number): string => `${value}%`;

const renderHapticsControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (!key.startsWith(prefix)) return null;
  const { settings, onChange, disabled } = ctx;
  const field = key.slice(prefix.length) as keyof HapticSettings;
  const value = settings.haptics[field];
  const change = (next: boolean | number): void => onChange(hapticPatch(settings, field, next));
  if (typeof value === 'number') {
    return createElement(SliderControl, { settingKey: key, value, min: 10, max: 100, step: 5, format: percent, onChange: change, disabled });
  }
  return createElement(ToggleControl, { settingKey: key, value, onChange: change, disabled });
};

export { renderHapticsControl };
