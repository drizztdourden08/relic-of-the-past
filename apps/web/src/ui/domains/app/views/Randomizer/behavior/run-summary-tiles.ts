/* @layer renderer-components @kind logic */
import type { StatTileProps } from '@ds/primitives';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { SessionSource } from '@app/lib/game/randomizer-client';

const sourceLabel = (source: SessionSource | null): string =>
  source === 'profile' ? 'started by this profile' : source === 'manual' ? 'started manually' : 'not started';

const summaryTilesOf = (profileName: string, config: ProfileRandomizerConfig, source: SessionSource | null): StatTileProps[] => {
  const tiles: StatTileProps[] = [
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
