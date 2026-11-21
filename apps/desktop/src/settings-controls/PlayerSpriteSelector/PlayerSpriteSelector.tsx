/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteLibrary } from '@app/views/PlayerSpriteStudio/behavior/useSpriteLibrary';
import { SpriteChoiceCard } from './sub-components/SpriteChoiceCard';
import type { PlayerSpriteSelectorProps, SpriteChoice } from './PlayerSpriteSelector.type';
import './PlayerSpriteSelector.css';

const PlayerSpriteSelector = (props: PlayerSpriteSelectorProps) => {
  const { value, onChange } = props;
  const t = useT();
  const { entries, stockPreview, loading } = useSpriteLibrary();

  const choices = useMemo<SpriteChoice[]>(
    () => [
      { name: null, label: t('settings-controls:sprite.original'), preview: stockPreview },
      ...entries.map((e) => ({ name: e.name, label: e.label, preview: e.preview })),
    ],
    [entries, stockPreview, t],
  );

  return (
    <Box className="player-sprite-selector">
      <Text className="player-sprite-selector__title">{t('settings-controls:sprite.title')}</Text>
      <Text className="player-sprite-selector__hint">
        {t('settings-controls:sprite.hint')}
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
      {loading && <Text className="player-sprite-selector__hint">{t('settings-controls:sprite.loading')}</Text>}
    </Box>
  );
};

export { PlayerSpriteSelector };
