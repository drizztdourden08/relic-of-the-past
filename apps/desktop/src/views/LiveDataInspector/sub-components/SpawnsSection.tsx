/* @layer renderer-widgets @kind component */
import { Box, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { liveOnlySpawns } from '../behavior/live-only-spawns';
import { SPAWNS_NONE, SPAWNS_TITLE } from '../LiveDataInspector.constants';
import type { SpawnsSectionProps } from '../LiveDataInspector.type';
import { SpawnRow } from './SpawnRow';
import './SpawnsSection.css';

const SpawnsSection = (props: SpawnsSectionProps) => {
  const { spawns, diff } = props;
  const recorded = spawns ?? [];
  const extra = liveOnlySpawns(recorded, diff);

  return (
    <Box className="spawns-section">
      <Text as="span" className="spawns-section__label">{SPAWNS_TITLE}</Text>
      {recorded.length === 0 && extra.length === 0 ? (
        <Text className="spawns-section__empty">{SPAWNS_NONE}</Text>
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
