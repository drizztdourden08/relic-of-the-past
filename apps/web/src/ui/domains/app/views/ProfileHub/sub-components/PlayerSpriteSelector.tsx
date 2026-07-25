/* @layer renderer-components @kind component */
/** Card-grid picker for the profile's player sprite. Reads the global player sprite library; "Original" = default. */
import { useMemo, type KeyboardEvent } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { useLinkSprites } from '@app/hooks/useLinkSprites';
import './PlayerSpriteSelector.css';

interface PlayerSpriteSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface Choice {
  name: string | null;
  label: string;
  preview: string | null;
}

const PlayerSpriteSelector = (props: PlayerSpriteSelectorProps) => {
  const { value, onChange } = props;
  const { sprites, loading } = useLinkSprites();

  const choices = useMemo<Choice[]>(
    () => [
      { name: null, label: 'Original', preview: null },
      ...sprites.map((s) => ({ name: s.name, label: s.name.replace(/\.zspr$/i, ''), preview: s.preview })),
    ],
    [sprites],
  );

  const onKey = (e: KeyboardEvent, name: string | null) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(name); }
  };

  return (
    <Box className="player-sprite-selector">
      <Text className="player-sprite-selector__title">Player Sprite</Text>
      <Text className="player-sprite-selector__hint">
        Manage sprites in Data Manager › Player Sprites. Applies when the game starts.
      </Text>
      <Box className="player-sprite-selector__grid">
        {choices.map((c) => {
          const selected = (c.name ?? null) === (value ?? null);
          return (
            <Box
              key={c.name ?? '__original'}
              className={`sprite-choice${selected ? ' sprite-choice--selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onChange(c.name)}
              onKeyDown={(e) => onKey(e, c.name)}
            >
              {c.preview
                ? <Image className="sprite-choice__preview" src={c.preview} alt={c.label} draggable={false} />
                : <Box className="sprite-choice__preview sprite-choice__preview--none"><Text>{c.name ? '?' : '🟢'}</Text></Box>}
              <Text className="sprite-choice__label">{c.label}</Text>
            </Box>
          );
        })}
      </Box>
      {loading && <Text className="player-sprite-selector__hint">Loading sprites…</Text>}
    </Box>
  );
};

export { PlayerSpriteSelector };
export type { PlayerSpriteSelectorProps };
