/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { Toggle } from '@drizztdourden08/tessera/primitives';
import { legacyMaster } from './legacy-master';
import type { SettingsPatch } from './settings-controls.type';

const renderBugFixControl = (key: string, s: GameSettings, onChange: SettingsPatch): ReactNode | null => {
  const fix = BUNDLE_FIXES.find((f) => f.id === key);
  if (!fix) return null;
  const checked = s.bugFixToggles?.[key] ?? legacyMaster(fix.bundleOrigin, s);
  return (
    <Toggle
      label={fix.label}
      description={fix.userMessage}
      checked={checked}
      onChange={(v) => onChange({ bugFixToggles: { ...s.bugFixToggles, [key]: v } })}
    />
  );
};

export { renderBugFixControl };
