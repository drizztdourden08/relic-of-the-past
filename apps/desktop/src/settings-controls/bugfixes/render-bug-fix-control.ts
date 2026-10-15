/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { BUNDLE_FIXES } from '@rotp/features';
import { KeyedControlRow } from '../KeyedControlRow';
import { bundleMaster } from './bundle-master';
import type { ControlContext } from '../settings-controls.type';

const renderBugFixControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  const fix = BUNDLE_FIXES.find((f) => f.id === key);
  if (!fix) return null;
  const checked = settings.bugFixToggles?.[key] ?? bundleMaster(fix.bundleOrigin, settings);
  const toggle = (next: boolean) => onChange({ bugFixToggles: { ...settings.bugFixToggles, [key]: next } });
  return createElement(KeyedControlRow, { settingKey: key, input: { kind: 'toggle', value: checked, onChange: toggle }, disabled });
};

export { renderBugFixControl };
