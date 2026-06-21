/* @layer renderer-components @kind component */
/** Card-grid picker for the profile's Link sprite. Reads the global Link sprite library; "Original" = default. */
import { useMemo, type KeyboardEvent } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { useLinkSprites } from '@app/hooks/useLinkSprites';
import './LinkSpriteSelector.css';

interface LinkSpriteSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface Choice {
  name: string | null;
  label: string;
  preview: string | null;
}

const LinkSpriteSelector = (props: LinkSpriteSelectorProps) => {
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
    <Box className="link-sprite-selector">
      <Text className="link-sprite-selector__title">Link Sprite</Text>
      <Text className="link-sprite-selector__hint">
        Manage sprites in Data Manager › Link Sprites. Applies when the game starts.
      </Text>
      <Box className="link-sprite-selector__grid">
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
      {loading && <Text className="link-sprite-selector__hint">Loading sprites…</Text>}
    </Box>
  );
};

export { LinkSpriteSelector };
export type { LinkSpriteSelectorProps };
