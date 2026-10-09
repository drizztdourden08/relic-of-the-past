/* @layer renderer-components @kind component */
import { Box, Text, Image, TextInput } from '@drizztdourden08/tessera/primitives';
import type { SpriteManifestEntry } from '@rotp/game-data';
import type { ReviewEntry, ReviewStatus } from '../SpriteDebug.type';
import { S } from '../SpriteDebug.constants';
import { StatusBtns } from './StatusBtns';

const SpriteImageCard = ({ sprite, entry, baseUrl, onSetStatus, onSetComment }: {
  sprite: SpriteManifestEntry; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) => {
  const border = entry.status === 'good' ? 'var(--c-secondary-bright)' : entry.status === 'bad' ? 'var(--c-danger)' : entry.status === 'yellow' ? 'var(--c-warning)' : 'var(--c-border)';
  const bg = entry.status === 'good' ? 'var(--c-secondary-soft)' : entry.status === 'bad' ? 'var(--c-danger-soft)' : entry.status === 'yellow' ? 'var(--c-warning-soft)' : 'var(--c-hover)';
  const catColor = sprite.category === 'hud' || sprite.category === 'hud-pause' || sprite.category === 'hud-item' ? '#8bb4e0' : sprite.category === 'fonts' ? '#b89de0' : sprite.category === 'receipt' ? '#c4a862' : '#82c487';

  return (
    <Box style={{ ...S.card, borderColor: border, background: bg }}>
      <Box style={S.cardTop}>
        <Box style={S.spriteWrap}>
          <Image src={`${baseUrl}${sprite.file}.png`} alt={sprite.label} style={S.sprite} draggable={false}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Box>
        <Box style={S.cardInfo}>
          <Text style={S.itemName}>{sprite.label}</Text>
          <Text style={S.fileName}>{sprite.file}.png</Text>
          <Text style={{ fontSize: 9, color: catColor }}>{sprite.category}</Text>
        </Box>
        <StatusBtns current={entry.status} onClick={onSetStatus} />
      </Box>
      {(entry.status === 'bad' || entry.status === 'yellow') && (
        <TextInput style={S.commentInput} placeholder="What's wrong with this sprite?"
          value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
          onClick={e => e.stopPropagation()} />
      )}
    </Box>
  );
};

export { SpriteImageCard };
