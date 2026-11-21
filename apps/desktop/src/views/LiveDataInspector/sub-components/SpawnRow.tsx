/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import { resolveRecordLabel } from '@app/data-inspector/record-links';
import type { ScreenSpawn } from '@rotp/game-data';
import { SPAWN_LIVE_ONLY_TITLE } from '../LiveDataInspector.constants';
import type { SpawnRowProps } from '../LiveDataInspector.type';

const tileLabel = (t: I18n['t'], tile: ScreenSpawn['tile']): string => t('views-live-data-inspector:spawn.tile', { row: tile.y, col: tile.x });

const SpawnRow = (props: SpawnRowProps) => {
  const { spawn, liveOnly } = props;
  const t = useT();
  const text = useText();
  const rowClass = `spawns-section__row${liveOnly ? ' spawns-section__row--live-only' : ''}`;
  return (
    <Flex className={rowClass} align="center" gap="xs" title={liveOnly ? text(SPAWN_LIVE_ONLY_TITLE) : undefined}>
      <Text as="span" className="spawns-section__name">{resolveRecordLabel(spawn.actorId)}</Text>
      <Text as="span" className="spawns-section__tile">{tileLabel(t, spawn.tile)}</Text>
    </Flex>
  );
};

export { SpawnRow };
