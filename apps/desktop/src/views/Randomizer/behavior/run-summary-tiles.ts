/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { SessionSource } from '@app/game/randomizer-client';
import { SOURCE_LABEL } from './run-summary-tiles.constants';
import type { RunTile } from './run-tile.type';

const sourceLabel = (source: SessionSource | null): string => (source === null ? 'not started' : SOURCE_LABEL[source]);

const summaryTilesOf = (profileName: string, config: ProfileRandomizerConfig, source: SessionSource | null): RunTile[] => {
  const tiles: RunTile[] = [
    { label: 'profile', value: profileName },
    { label: 'seed', value: config.seed },
    { label: 'mode', value: config.mode },
    { label: 'origin', value: sourceLabel(source) },
  ];
  if (config.mode !== 'online') return tiles;
  return [
    ...tiles,
    { label: 'server', value: config.serverUrl ?? '(none)' },
    { label: 'slot', value: config.slotName ?? 'Player' },
    { label: 'death link', value: config.deathLink ? 'on' : 'off' },
  ];
};

export { summaryTilesOf };
