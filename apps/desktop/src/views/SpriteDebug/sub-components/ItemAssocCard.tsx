/* @layer renderer-components @kind component */
import { Box, Text, Image, TextInput } from '@drizztdourden08/tessera/primitives';
import type { ReviewEntry, ReviewStatus } from '../SpriteDebug.type';
import { NONE_LABEL, S } from '../SpriteDebug.constants';
import { StatusBtns } from './StatusBtns';

const ItemAssocCard = ({ item, entry, baseUrl, onSetStatus, onSetComment }: {
  item: { name: string; file: string }; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) => {
  const border = entry.status === 'good' ? 'var(--c-secondary-bright)' : entry.status === 'bad' ? 'var(--c-danger)' : entry.status === 'yellow' ? 'var(--c-warning)' : 'var(--c-border)';
  const bg = entry.status === 'good' ? 'var(--c-secondary-soft)' : entry.status === 'bad' ? 'var(--c-danger-soft)' : entry.status === 'yellow' ? 'var(--c-warning-soft)' : 'var(--c-hover)';

  return (
    <Box style={{ ...S.card, borderColor: border, background: bg }}>
      <Box style={S.cardTop}>
        <Box style={S.spriteWrap}>
          {item.file ? (
            <Image src={`${baseUrl}${item.file}.png`} alt={item.name} style={S.sprite} draggable={false}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <Text style={NONE_LABEL}>none</Text>
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

export { ItemAssocCard };
