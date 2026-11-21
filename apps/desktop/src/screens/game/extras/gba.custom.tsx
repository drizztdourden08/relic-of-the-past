/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { useSettings } from '@drizztdourden08/brock-react';
import type { ScreenMeta, SearchEntrySeed } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { GbaSettings } from '@app/views/ProfileHub/sub-components/gba-settings';
import { isExperimental } from '@app/shell/show-rules';

const meta: ScreenMeta = { title: 'GBA', icon: 'puzzle', showHeader: true, order: 5, when: isExperimental, keywords: ['gba', 'game boy advance', 'second cartridge', 'four swords', 'extra dungeon'] };

const searchEntries: SearchEntrySeed[] = [
  { label: msg('data-manager:settings-search.extra-dungeon.label'), keywords: ['post game', 'second cartridge', 'supplement', 'extra dungeon'], anchor: 'extraDungeon', description: msg('data-manager:settings-search.extra-dungeon.description') },
  { label: msg('data-manager:settings-search.gba-tracker.label'), keywords: ['differences', 'changes', 'catalogue', 'progress', 'in progress', 'tracker'], anchor: 'gba-differences', description: msg('data-manager:settings-search.gba-tracker.description') },
];

const GbaPage = () => {
  const { settings, patch } = useSettings<AppSettings>();
  return <GbaSettings settings={settings} onChange={patch} />;
};

export default GbaPage;
export { meta, searchEntries };
