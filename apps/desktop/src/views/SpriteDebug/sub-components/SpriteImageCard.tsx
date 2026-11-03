/* @layer renderer-components @kind component */
import { Text, Image } from '@drizztdourden08/tessera/primitives';
import type { SpriteManifestEntry } from '@rotp/game-data';
import type { ReviewSubjectCardProps } from '../SpriteDebug.type';
import { spriteCategoryTone } from '../behavior/sprite-category-tone';
import { ReviewCard } from './ReviewCard';

const SpriteImageCard = ({ sprite, entry, baseUrl, onSetStatus, onSetComment }: ReviewSubjectCardProps & { sprite: SpriteManifestEntry }) => (
  <ReviewCard
    entry={entry}
    onSetStatus={onSetStatus}
    onSetComment={onSetComment}
    commentPlaceholder="What's wrong with this sprite?"
    sprite={(
      <Image src={`${baseUrl}${sprite.file}.png`} alt={sprite.label} draggable={false}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} className="sprite-debug-sprite" />
    )}
    info={(
      <>
        <Text className="sprite-debug-item-name">{sprite.label}</Text>
        <Text className="sprite-debug-file-name">{sprite.file}.png</Text>
        <Text data-tone={spriteCategoryTone(sprite.category)} className="sprite-debug-category">{sprite.category}</Text>
      </>
    )}
  />
);

export { SpriteImageCard };
