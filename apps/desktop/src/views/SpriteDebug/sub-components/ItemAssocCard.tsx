/* @layer renderer-components @kind component */
import { Box, Text, Image, TextInput } from '@drizztdourden08/tessera/primitives';
import type { ReviewEntry, ReviewStatus } from '../SpriteDebug.type';
import { StatusBtns } from './StatusBtns';

const ItemAssocCard = ({ item, entry, baseUrl, onSetStatus, onSetComment }: {
  item: { name: string; file: string }; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) => (
  <Box data-status={entry.status} className="sprite-debug-card">
    <Box className="sprite-debug-card-top">
      <Box className="sprite-debug-sprite-wrap">
        {item.file ? (
          <Image src={`${baseUrl}${item.file}.png`} alt={item.name} draggable={false}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} className="sprite-debug-sprite" />
        ) : (
          <Text className="sprite-debug-none-label">none</Text>
        )}
      </Box>
      <Box className="sprite-debug-card-info">
        <Text className="sprite-debug-item-name">{item.name}</Text>
        <Text className="sprite-debug-file-name">{item.file ? `${item.file}.png` : '(no sprite)'}</Text>
      </Box>
      <StatusBtns current={entry.status} onClick={onSetStatus} />
    </Box>
    {(entry.status === 'bad' || entry.status === 'yellow') && (
      <TextInput placeholder="Which sprite should this item use?"
        value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
        onClick={e => e.stopPropagation()} className="sprite-debug-comment-input" />
    )}
  </Box>
);

export { ItemAssocCard };
