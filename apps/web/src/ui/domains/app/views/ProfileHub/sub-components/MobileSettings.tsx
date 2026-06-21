/* @layer renderer-components @kind component */
/** Mobile tab — mobile/device-specific display options. */
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { MOBILE_SECTION } from './SettingsView.constants';

interface MobileSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const SECTIONS: Section[] = [MOBILE_SECTION];

const MobileSettings = (props: MobileSettingsProps) => {
  const { settings, onChange } = props;
  return <SettingsLayout sections={SECTIONS} settings={settings} onChange={onChange} />;
};

export { MobileSettings };
