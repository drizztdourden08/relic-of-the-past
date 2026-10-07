/* @layer renderer-components @kind logic */
/**
 * The options summary as dashboard tiles: each count out of its whole with a meter, so how
 * far a block departs from the game as shipped reads as a bar before it reads as a number.
 */
import type { StatTileProps } from '@ds/primitives';
import type { PoolAccounting } from '@shared/randomizer/world/pool/pool-accounting';
import type { OptionsSummary, Tally } from './options-summary.type';

const outOf = (tally: Tally): string => `${tally.count} of ${tally.total}`;

const tallyTile = (label: string, tally: Tally): StatTileProps =>
  ({ label, value: outOf(tally), meter: { value: tally.count, max: tally.total } });

/** The locations the fill shuffles against those it leaves holding their own item. */
const locationTilesOf = (accounting: PoolAccounting): StatTileProps[] => [
  tallyTile('locations shuffled', { count: accounting.open, total: accounting.open + accounting.lockedVanilla }),
  { label: 'kept vanilla', value: String(accounting.lockedVanilla) },
];

const settingTilesOf = (summary: OptionsSummary): StatTileProps[] => [
  tallyTile('settings changed', summary.changed),
  tallyTile('dungeon items moved', summary.dungeonItems),
  tallyTile('progressive rungs', summary.rungs),
  tallyTile('story gates changed', summary.storyGates),
  summary.lightRequired ? tallyTile('dark-room lights', summary.lights) : { label: 'dark-room lights', value: 'not required' },
  tallyTile('ponds selling throws', summary.ponds),
];

export { locationTilesOf, outOf, settingTilesOf };
