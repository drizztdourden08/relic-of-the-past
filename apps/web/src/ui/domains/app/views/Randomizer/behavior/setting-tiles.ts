/* @layer renderer-components @kind logic */
import type { StatTileProps } from '@ds/primitives';
import { tallyTile } from './tally-tile';
import type { OptionsSummary } from './options-summary.type';

const settingTilesOf = (summary: OptionsSummary): StatTileProps[] => [
  tallyTile('settings changed', summary.changed),
  tallyTile('dungeon items moved', summary.dungeonItems),
  tallyTile('progressive rungs', summary.rungs),
  tallyTile('story gates changed', summary.storyGates),
  summary.lightRequired ? tallyTile('dark-room lights', summary.lights) : { label: 'dark-room lights', value: 'not required' },
  tallyTile('ponds selling throws', summary.ponds),
];

export { settingTilesOf };
