/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { buildBugFixSection } from './build-bug-fix-section';
import { renderBugFixControl } from './bugfix-settings-controls';
import type { SettingsTabProps } from './settings-controls.type';

const BugFixesSettings = (props: SettingsTabProps) => {
  const { settings, onChange } = props;
  const sections = useMemo<Section[]>(() => [buildBugFixSection()], []);
  return (
    <SettingsLayout
      sections={sections}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderBugFixControl}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { BugFixesSettings };
