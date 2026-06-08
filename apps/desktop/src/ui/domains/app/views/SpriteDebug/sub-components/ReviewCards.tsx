/* @layer renderer-components @kind component */
import { Box, Text, Image, TextInput } from '../../../../../design-system/primitives';
import type { ReviewEntry, ReviewStatus } from '../SpriteDebug.type';
import type { SpriteManifestEntry } from '@shared/game/sprites';
import { StatusBtns } from './ReviewControls';
import { S } from '../SpriteDebug.constants';

const SpriteImageCard = ({ sprite, entry, baseUrl, onSetStatus, onSetComment }: {
  sprite: SpriteManifestEntry; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) => {
  const border = entry.status === 'good' ? '#4caf50' : entry.status === 'bad' ? '#f44336' : entry.status === 'yellow' ? '#f5c542' : 'rgba(255,255,255,0.08)';
  const bg = entry.status === 'good' ? 'rgba(76,175,80,0.06)' : entry.status === 'bad' ? 'rgba(244,67,54,0.06)' : entry.status === 'yellow' ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)';
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

const ItemAssocCard = ({ item, entry, baseUrl, onSetStatus, onSetComment }: {
  item: { name: string; file: string }; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) => {
  const border = entry.status === 'good' ? '#4caf50' : entry.status === 'bad' ? '#f44336' : entry.status === 'yellow' ? '#f5c542' : 'rgba(255,255,255,0.08)';
  const bg = entry.status === 'good' ? 'rgba(76,175,80,0.06)' : entry.status === 'bad' ? 'rgba(244,67,54,0.06)' : entry.status === 'yellow' ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)';

  return (
    <Box style={{ ...S.card, borderColor: border, background: bg }}>
      <Box style={S.cardTop}>
        <Box style={S.spriteWrap}>
          {item.file ? (
            <Image src={`${baseUrl}${item.file}.png`} alt={item.name} style={S.sprite} draggable={false}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <Text style={{ fontSize: 9, color: '#555' }}>none</Text>
          )}
        </Box>
        <Box style={S.cardInfo}>
          <Text style={S.itemName}>{item.name}</Text>
          <Text style={S.fileName}>{item.file ? `${item.file}.png` : '(no sprite)'}</Text>
        </Box>
        <StatusBtns current={entry.status} onClick={onSetStatus} />
      </Box>
      {(entry.status === 'bad' || entry.status === 'yellow') && (
        <TextInput style={S.commentInput} placeholder="Which sprite should this item use?"
          value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
          onClick={e => e.stopPropagation()} />
      )}
    </Box>
  );
};

export { ItemAssocCard, SpriteImageCard };
