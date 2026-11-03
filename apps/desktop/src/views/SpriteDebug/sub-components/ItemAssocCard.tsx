/* @layer renderer-components @kind component */
import { Text, Image } from '@drizztdourden08/tessera/primitives';
import type { ReviewSubjectCardProps } from '../SpriteDebug.type';
import { ReviewCard } from './ReviewCard';

const ItemAssocCard = ({ item, entry, baseUrl, onSetStatus, onSetComment }: ReviewSubjectCardProps & { item: { name: string; file: string } }) => (
  <ReviewCard
    entry={entry}
    onSetStatus={onSetStatus}
    onSetComment={onSetComment}
    commentPlaceholder="Which sprite should this item use?"
    sprite={item.file ? (
      <Image src={`${baseUrl}${item.file}.png`} alt={item.name} draggable={false}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} className="sprite-debug-sprite" />
    ) : (
      <Text className="sprite-debug-none-label">none</Text>
    )}
    info={(
      <>
        <Text className="sprite-debug-item-name">{item.name}</Text>
        <Text className="sprite-debug-file-name">{item.file ? `${item.file}.png` : '(no sprite)'}</Text>
      </>
    )}
  />
);

export { ItemAssocCard };
