/* @layer renderer-components @kind component */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS, SANCTUARY_ACCOUNT_KEY } from './developer-settings-sections';
import { SanctuaryAccountCard } from './SanctuaryAccountCard';

interface DeveloperSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

/** The account row is the one item here that is not a toggle. */
const renderControl = (key: string) => (key === SANCTUARY_ACCOUNT_KEY ? <SanctuaryAccountCard /> : null);

const DeveloperSettings = (props: DeveloperSettingsProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      renderControl={renderControl}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { DeveloperSettings };
