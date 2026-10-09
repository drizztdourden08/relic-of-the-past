/* @layer renderer-components @kind logic */
import { tallyTile } from './tally-tile';
import type { OptionsSummary } from './options-summary.type';
import type { RunTile } from './run-tile.type';

const settingTilesOf = (summary: OptionsSummary): RunTile[] => [
  tallyTile('settings changed', summary.changed),
  tallyTile('dungeon items moved', summary.dungeonItems),
  tallyTile('progressive rungs', summary.rungs),
  tallyTile('story gates changed', summary.storyGates),
  summary.lightRequired ? tallyTile('dark-room lights', summary.lights) : { label: 'dark-room lights', value: 'not required' },
  tallyTile('ponds selling throws', summary.ponds),
];

export { settingTilesOf };
