/* @layer renderer-components @kind component */
/** The bundle masters plus the 42 split per-fix toggles. */
import { useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { buildBugFixSection, renderBugFixControl } from './bugfix-settings-controls';

interface BugFixesSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const BugFixesSettings = (props: BugFixesSettingsProps) => {
  const { settings, onChange } = props;
  const sections = useMemo<Section[]>(() => [buildBugFixSection()], []);
  return (
    <SettingsLayout
      sections={sections}
      settings={settings}
      onChange={onChange}
      renderControl={renderBugFixControl}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { BugFixesSettings };
