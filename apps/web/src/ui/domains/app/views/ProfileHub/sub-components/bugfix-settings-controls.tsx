/* @layer renderer-components @kind logic */
/**
 * The "Bug Fixes" settings section, generated from the registry (the 42 split bug-fixes).
 * Each fix is an opt-in toggle stored in settings.bugFixToggles; when a fix has no explicit
 * override it inherits the legacy bundle master it was extracted from, so existing profiles keep
 * their behavior. Mirrors buildFeatureWords in the bridge (live-settings-flags.ts).
 */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { Toggle } from '@app/ui/design-system/primitives/Toggle';
import { buildBugFixSection, legacyMaster } from './bugfix-settings-sections';

type Patch = (patch: Partial<GameSettings>) => void;

const renderBugFixControl = (key: string, s: GameSettings, onChange: Patch): ReactNode | null => {
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

export { buildBugFixSection, renderBugFixControl };
