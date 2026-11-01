/* @layer renderer-components @kind component */
import { Box, TextInput } from '@drizztdourden08/tessera/primitives';
import type { ReviewCardProps } from '../SpriteDebug.type';
import { StatusBtns } from './StatusBtns';

const ReviewCard = ({ entry, onSetStatus, onSetComment, commentPlaceholder, sprite, info }: ReviewCardProps) => (
  <Box data-status={entry.status} className="sprite-debug-card">
    <Box className="sprite-debug-card-top">
      <Box className="sprite-debug-sprite-wrap">{sprite}</Box>
      <Box className="sprite-debug-card-info">{info}</Box>
      <StatusBtns current={entry.status} onClick={onSetStatus} />
    </Box>
    {(entry.status === 'bad' || entry.status === 'yellow') && (
      <TextInput placeholder={commentPlaceholder}
        value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
        onClick={e => e.stopPropagation()} className="sprite-debug-comment-input" />
    )}
  </Box>
);

export { ReviewCard };
