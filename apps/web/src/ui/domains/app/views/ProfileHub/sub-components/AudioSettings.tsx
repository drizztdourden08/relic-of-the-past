/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS } from './audio-settings-sections.constants';
import { renderControl } from './audio-settings-controls';
import { isAudioSettingDisabled } from './audio-settings-disabled';
import { useMsuPackProfile } from './useMsuPackProfile';
import type { ProfileScopedTabProps } from './settings-controls.type';

const AudioSettings = (props: ProfileScopedTabProps) => {
  const { settings, onChange, profileId } = props;
  const { pack } = useMsuPackProfile(profileId);
  const boundRenderControl = useCallback(
    (key: string, s: GameSettings, change: (patch: Partial<GameSettings>) => void) => renderControl(key, s, change, pack),
    [pack],
  );
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={boundRenderControl}
      isDisabled={isAudioSettingDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { AudioSettings };
