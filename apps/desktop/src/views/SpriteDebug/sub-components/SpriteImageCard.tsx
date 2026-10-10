/* @layer renderer-components @kind component */
import { Box, Text, Image, TextInput } from '@drizztdourden08/tessera/primitives';
import type { SpriteManifestEntry } from '@rotp/game-data';
import type { ReviewEntry, ReviewStatus } from '../SpriteDebug.type';
import { spriteCategoryTone } from '../behavior/sprite-category-tone';
import { StatusBtns } from './StatusBtns';

const SpriteImageCard = ({ sprite, entry, baseUrl, onSetStatus, onSetComment }: {
  sprite: SpriteManifestEntry; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) => (
  <Box data-status={entry.status} className="sprite-debug-card">
    <Box className="sprite-debug-card-top">
      <Box className="sprite-debug-sprite-wrap">
        <Image src={`${baseUrl}${sprite.file}.png`} alt={sprite.label} draggable={false}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} className="sprite-debug-sprite" />
      </Box>
      <Box className="sprite-debug-card-info">
        <Text className="sprite-debug-item-name">{sprite.label}</Text>
        <Text className="sprite-debug-file-name">{sprite.file}.png</Text>
        <Text data-tone={spriteCategoryTone(sprite.category)} className="sprite-debug-category">{sprite.category}</Text>
      </Box>
      <StatusBtns current={entry.status} onClick={onSetStatus} />
    </Box>
    {(entry.status === 'bad' || entry.status === 'yellow') && (
      <TextInput placeholder="What's wrong with this sprite?"
        value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
        onClick={e => e.stopPropagation()} className="sprite-debug-comment-input" />
    )}
  </Box>
);

export { SpriteImageCard };
