/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Toggle } from '@ds/primitives';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { SECTIONS, SESSION_ITEMS } from './online-settings-sections.constants';
import type { OnlineSettingsProps, SessionSwitchKey } from './online-settings-sections.type';

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
