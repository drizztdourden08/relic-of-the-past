/* @layer renderer-widgets @kind component */
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import { resolveRecordLabel } from '@app/views/DataInspector/behavior/record-links';
import type { ScreenSpawn } from '@rotp/game-data';
import { SPAWN_LIVE_ONLY_TITLE } from '../LiveDataInspector.constants';
import type { SpawnRowProps } from '../LiveDataInspector.type';

const tileLabel = (tile: ScreenSpawn['tile']): string => `r${tile.y} c${tile.x}`;

const SpawnRow = (props: SpawnRowProps) => {
  const { spawn, liveOnly } = props;
  const rowClass = `spawns-section__row${liveOnly ? ' spawns-section__row--live-only' : ''}`;
  return (
    <Flex className={rowClass} align="center" gap="xs" title={liveOnly ? SPAWN_LIVE_ONLY_TITLE : undefined}>
      <Text as="span" className="spawns-section__name">{resolveRecordLabel(spawn.actorId)}</Text>
      <Text as="span" className="spawns-section__tile">{tileLabel(spawn.tile)}</Text>
    </Flex>
  );
};

export { SpawnRow };
