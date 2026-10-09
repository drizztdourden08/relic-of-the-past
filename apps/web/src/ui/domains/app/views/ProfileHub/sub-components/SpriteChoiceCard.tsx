/* @layer renderer-components @kind component */
import { useCallback, type KeyboardEvent } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import type { SpriteChoiceCardProps } from './PlayerSpriteSelector.type';

const SpriteChoiceCard = ({ choice, selected, onChange }: SpriteChoiceCardProps) => {
  const { name, label, preview } = choice;
  const handleClick = useCallback(() => onChange(name), [onChange, name]);
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(name); }
  }, [onChange, name]);

  return (
    <Box
      className={`sprite-choice${selected ? ' sprite-choice--selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      {preview
        ? <Image className="sprite-choice__preview" src={preview} alt={label} draggable={false} />
        : <Box className="sprite-choice__preview sprite-choice__preview--none"><Text>{name ? '?' : '🟢'}</Text></Box>}
      <Text className="sprite-choice__label">{label}</Text>
    </Box>
  );
};

export { SpriteChoiceCard };
