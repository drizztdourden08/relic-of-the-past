/* @layer renderer-components @kind component */
/**
 * The Online tab: which notices of an Archipelago session show as toasts. The same component is
 * the Online tab of the Randomizer page.
 */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SECTIONS } from './online-settings-sections';

interface OnlineSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const OnlineSettings = ({ settings, onChange }: OnlineSettingsProps) => (
  <SettingsLayout sections={SECTIONS} settings={settings} defaults={DEFAULT_SETTINGS} onChange={onChange} />
);

export { OnlineSettings };
export type { OnlineSettingsProps };
