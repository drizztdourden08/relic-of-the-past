/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { KeyedControlRow } from '../ControlRow';
import { legacyMaster } from './legacy-master';
import type { ControlContext } from '../settings-controls.type';

const renderBugFixControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  const fix = BUNDLE_FIXES.find((f) => f.id === key);
  if (!fix) return null;
  const checked = settings.bugFixToggles?.[key] ?? legacyMaster(fix.bundleOrigin, settings);
  return (
    <KeyedControlRow
      settingKey={key}
      input={{ kind: 'toggle', value: checked, onChange: (next) => onChange({ bugFixToggles: { ...settings.bugFixToggles, [key]: next } }) }}
      disabled={disabled}
    />
  );
};

export { renderBugFixControl };
