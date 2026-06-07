/* @layer renderer-components @kind component */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { MsuImport } from './MsuImport';
import { SettingsLayout } from '../../../composites/SettingsLayout';
import { SECTIONS } from './audio-settings-sections';
import { renderControl, isDisabled } from './audio-settings-controls';

interface AudioSettingsProps {
  profileId: string;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const AudioSettings = (props: AudioSettingsProps) => {
  const { profileId, settings, onChange } = props;
  const renderControlWithProfile = (key: string, s: GameSettings, cb: (patch: Partial<GameSettings>) => void): ReactNode | null => {
    if (key === 'msuImport') {
      return <MsuImport profileId={profileId} />;
    }
    return renderControl(key, s, cb);
  };

  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControlWithProfile}
      isDisabled={isDisabled}
    />
  );
};

export { AudioSettings };
