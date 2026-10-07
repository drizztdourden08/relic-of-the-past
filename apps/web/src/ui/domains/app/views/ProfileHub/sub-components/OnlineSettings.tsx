/* @layer renderer-components @kind component */
/**
 * The Online tab: the session's two switches (DeathLink, tracking the other players), then
 * which notices of an Archipelago session show as toasts. The switches belong to the profile's
 * connection, not its settings, so they read and save through the profile (useProfileConnection),
 * which reconnects a running session on the new values. The same component is the Online tab of the
 * Randomizer page.
 */
import { useCallback } from 'react';
import { Toggle } from '@ds/primitives';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { SECTIONS, SESSION_ITEMS } from './online-settings-sections';
import type { SessionSwitchKey } from './online-settings-sections';

interface OnlineSettingsProps {
  profile: Profile | null;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const OnlineSettings = ({ profile, settings, onChange }: OnlineSettingsProps) => {
  const { config, saveConnection } = useProfileConnection(profile);

  const renderControl = useCallback((key: string) => {
    const item = SESSION_ITEMS[key as SessionSwitchKey];
    if (item === undefined) return null;
    const checked = config?.[item.field] ?? item.fallback;
    return (
      <Toggle
        label={item.label}
        description={item.description}
        checked={checked}
        disabled={config === null}
        onChange={(value) => void saveConnection({ [item.field]: value })}
      />
    );
  }, [config, saveConnection]);

  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderControl}
    />
  );
};

export { OnlineSettings };
export type { OnlineSettingsProps };
