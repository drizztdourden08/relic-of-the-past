/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { CATEGORY_LABELS } from '@shared/game/data';
import type { SpriteCardProps } from './SpriteGrid.type';

const SpriteCard = (props: SpriteCardProps) => {
  const { file, label, category, baseUrl } = props;
  return (
    <Box className="sprite-card">
      <Image className="sprite-card__img" src={`${baseUrl}${file}.png`} alt={label} draggable={false} />
      <Box className="sprite-card__info">
        <Text className="sprite-card__label">{label}</Text>
        <Text className="sprite-card__category">{CATEGORY_LABELS[category]}</Text>
      </Box>
    </Box>
  );
};

export { SpriteCard };
