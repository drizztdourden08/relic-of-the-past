/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteLibrary } from '@domains/app/views/PlayerSpriteStudio/behavior/useSpriteLibrary';
import { SpriteChoiceCard } from './sub-components/SpriteChoiceCard';
import type { PlayerSpriteSelectorProps, SpriteChoice } from './PlayerSpriteSelector.type';
import './PlayerSpriteSelector.css';

const PlayerSpriteSelector = (props: PlayerSpriteSelectorProps) => {
  const { value, onChange } = props;
  const { entries, loading } = useSpriteLibrary();

  const choices = useMemo<SpriteChoice[]>(
    () => [
      { name: null, label: 'Original', preview: null },
      ...entries.map((e) => ({ name: e.name, label: e.label, preview: e.preview })),
    ],
    [entries],
  );

  return (
    <Box className="player-sprite-selector">
      <Text className="player-sprite-selector__title">Player Sprite</Text>
      <Text className="player-sprite-selector__hint">
        Manage sprites in Data Manager › Character Studio. Applies right away.
      </Text>
      <Box className="player-sprite-selector__grid">
        {choices.map((c) => (
          <SpriteChoiceCard
            key={c.name ?? '__original'}
            choice={c}
            selected={(c.name ?? null) === (value ?? null)}
            onChange={onChange}
          />
        ))}
      </Box>
      {loading && <Text className="player-sprite-selector__hint">Loading sprites...</Text>}
    </Box>
  );
};

export { PlayerSpriteSelector };
export type { PlayerSpriteSelectorProps };
