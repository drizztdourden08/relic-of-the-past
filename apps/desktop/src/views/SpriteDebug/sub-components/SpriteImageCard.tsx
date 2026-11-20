/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Text, Image } from '@drizztdourden08/tessera/primitives';
import type { SpriteManifestEntry } from '@rotp/game-data';
import type { ReviewSubjectCardProps } from '../SpriteDebug.type';
import { spriteCategoryTone } from '../behavior/sprite-category-tone';
import { ReviewCard } from './ReviewCard';

const SpriteImageCard = ({ sprite, entry, baseUrl, onSetStatus, onSetComment }: ReviewSubjectCardProps & { sprite: SpriteManifestEntry }) => {
  const t = useT();
  const text = useText();
  return (
  <ReviewCard
    entry={entry}
    onSetStatus={onSetStatus}
    onSetComment={onSetComment}
    commentPlaceholder={t('views-sprite-debug:sprite.placeholder')}
    sprite={(
      <Image src={`${baseUrl}${sprite.file}.png`} alt={text(sprite.label)} draggable={false}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} className="sprite-debug-sprite" />
    )}
    info={(
      <>
        <Text className="sprite-debug-item-name">{text(sprite.label)}</Text>
        <Text className="sprite-debug-file-name">{sprite.file}.png</Text>
        <Text data-tone={spriteCategoryTone(sprite.category)} className="sprite-debug-category">{sprite.category}</Text>
      </>
    )}
  />
  );
};

export { SpriteImageCard };
