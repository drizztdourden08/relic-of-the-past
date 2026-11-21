/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text, Image } from '@drizztdourden08/tessera/primitives';
import type { ReviewSubjectCardProps } from '../SpriteDebug.type';
import { itemName } from '@app/game/record-text';
import { ReviewCard } from './ReviewCard';

const ItemAssocCard = ({ item, entry, baseUrl, onSetStatus, onSetComment }: ReviewSubjectCardProps & { item: { id: string; name: string; file: string } }) => {
  const t = useT();
  const name = itemName(item);
  return (
  <ReviewCard
    entry={entry}
    onSetStatus={onSetStatus}
    onSetComment={onSetComment}
    commentPlaceholder={t('views-sprite-debug:item.placeholder')}
    sprite={item.file ? (
      <Image src={`${baseUrl}${item.file}.png`} alt={name} draggable={false}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} className="sprite-debug-sprite" />
    ) : (
      <Text className="sprite-debug-none-label">{t('views-sprite-debug:item.none')}</Text>
    )}
    info={(
      <>
        <Text className="sprite-debug-item-name">{name}</Text>
        <Text className="sprite-debug-file-name">{item.file ? `${item.file}.png` : t('views-sprite-debug:item.noSprite')}</Text>
      </>
    )}
  />
  );
};

export { ItemAssocCard };
