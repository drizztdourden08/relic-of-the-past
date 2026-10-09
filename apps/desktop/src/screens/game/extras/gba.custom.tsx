/* @layer renderer-app @kind component */
import { useSettings } from '@drizztdourden08/brock-react';
import type { ScreenMeta, SearchEntrySeed } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { GbaSettings } from '@domains/app/views/ProfileHub/sub-components/gba-settings';

const meta: ScreenMeta = { title: 'Game Boy Advance', icon: 'puzzle', order: 5, keywords: ['gba', 'game boy advance', 'second cartridge', 'four swords', 'extra dungeon'] };

const searchEntries: SearchEntrySeed[] = [
  { label: 'Extra Dungeon', keywords: ['post game', 'second cartridge', 'supplement', 'extra dungeon'], anchor: 'extraDungeon', description: 'The optional post-game dungeon from the second cartridge' },
  { label: 'Game Boy Advance differences', keywords: ['differences', 'changes', 'catalogue', 'evidence', 'extracted'], anchor: 'gba-differences', description: 'Everything the Game Boy Advance release changes, for reference' },
];

const GbaPage = () => {
  const { settings, patch } = useSettings<AppSettings>();
  return <GbaSettings settings={settings} onChange={patch} />;
};

export default GbaPage;
export { meta, searchEntries };
