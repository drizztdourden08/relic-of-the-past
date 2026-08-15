/* @layer renderer-widgets @kind component */
/**
 * A screen's static actor spawns, each resolved to its actor's own name and
 * tile — the one array field whose element is a plain object, so the generic
 * array cell (`{...}` per entry, see `array-kit.tsx`'s `summarizeList`) tells
 * a reviewer nothing about it. `LiveDataInspector.tsx` drops `spawns` from the
 * schema it hands the record's own compact view and renders this instead, so
 * the field is shown here once rather than twice.
 *
 * A spawn the live game reports that the record does not yet catalogue is
 * appended below the recorded list and marked apart, the same red accent
 * `DiffBracket` uses for a live value that disagrees with the dataset — this
 * is that same finding, over a list instead of one field.
 */
import { Box, Flex, Text } from '@ds/primitives';
import { resolveRecordLabel } from '@app/ui/domains/app/views/DataInspector/behavior/record-links';
import { liveOnlySpawns } from '../behavior/spawn-diff';
import type { ScreenSpawn } from '@shared/game/data';
import type { Difference } from '@shared/game/recommendations';
import './SpawnsSection.css';

const TITLE = 'Spawns';
const NONE = 'No spawns recorded.';
const LIVE_ONLY_TITLE = 'Reported by the live game, not yet in this record.';

interface SpawnsSectionProps {
  spawns: readonly ScreenSpawn[] | undefined;
  diff?: Difference;
}

interface SpawnRowProps {
  spawn: ScreenSpawn;
  liveOnly?: boolean;
}

const tileLabel = (tile: ScreenSpawn['tile']): string => `r${tile.y} c${tile.x}`;

const SpawnRow = (props: SpawnRowProps) => {
  const { spawn, liveOnly } = props;
  const rowClass = `spawns-section__row${liveOnly ? ' spawns-section__row--live-only' : ''}`;
  return (
    <Flex className={rowClass} align="center" gap="xs" title={liveOnly ? LIVE_ONLY_TITLE : undefined}>
      <Text as="span" className="spawns-section__name">{resolveRecordLabel(spawn.actorId)}</Text>
      <Text as="span" className="spawns-section__tile">{tileLabel(spawn.tile)}</Text>
    </Flex>
  );
};

const SpawnsSection = (props: SpawnsSectionProps) => {
  const { spawns, diff } = props;
  const recorded = spawns ?? [];
  const extra = liveOnlySpawns(recorded, diff);

  return (
    <Box className="spawns-section">
      <Text as="span" className="spawns-section__label">{TITLE}</Text>
      {recorded.length === 0 && extra.length === 0 ? (
        <Text className="spawns-section__empty">{NONE}</Text>
      ) : (
        <Flex direction="column" gap="xs" className="spawns-section__list">
          {recorded.map((spawn, index) => (
            <SpawnRow key={`spawn-${index}`} spawn={spawn} />
          ))}
          {extra.map((spawn, index) => (
            <SpawnRow key={`live-${index}`} spawn={spawn} liveOnly />
          ))}
        </Flex>
      )}
    </Box>
  );
};

export { SpawnsSection };
export type { SpawnsSectionProps };
