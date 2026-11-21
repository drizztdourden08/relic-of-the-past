/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { tallyTile } from './tally-tile';
import type { OptionsSummary } from './options-summary.type';
import type { RunTile } from './run-tile.type';

const settingTilesOf = (t: I18n['t'], summary: OptionsSummary): RunTile[] => {
  const lights = t('views-randomizer:tiles.darkRoomLights');
  return [
    tallyTile(t, t('views-randomizer:tiles.settingsChanged'), summary.changed),
    tallyTile(t, t('views-randomizer:tiles.dungeonItemsMoved'), summary.dungeonItems),
    tallyTile(t, t('views-randomizer:tiles.progressiveRungs'), summary.rungs),
    tallyTile(t, t('views-randomizer:tiles.storyGatesChanged'), summary.storyGates),
    summary.lightRequired ? tallyTile(t, lights, summary.lights) : { label: lights, value: t('views-randomizer:tiles.notRequired') },
    tallyTile(t, t('views-randomizer:tiles.pondsSellingThrows'), summary.ponds),
  ];
};

export { settingTilesOf };
