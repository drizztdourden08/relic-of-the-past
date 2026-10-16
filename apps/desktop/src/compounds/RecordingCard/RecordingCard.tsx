/* @layer renderer-components @kind component */
import { Box, Checkbox, Icon, IconButton, Image, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { Video } from '@drizztdourden08/tessera/composites';
import { useCyclingFrame } from './behavior/useCyclingFrame';
import { DELETE_LABEL, NO_FRAMES, SENT_LABEL, TIME_FORMAT } from './RecordingCard.constants';
import type { RecordingCardProps } from './RecordingCard.type';
import './RecordingCard.css';

const RecordingCard = (props: RecordingCardProps) => {
  const { session, checked, disabled = false, onToggle, onDelete } = props;
  const { sessionKey, startedAt, previewKind, previewUrl, previewFrameUrls, sentAt } = session;
  const frame = useCyclingFrame(previewKind === 'images' ? previewFrameUrls : NO_FRAMES);
  const time = new Date(startedAt).toLocaleString(undefined, TIME_FORMAT);

  return (
    <Box className="recording-card">
      <Box className="recording-card__preview">
        {previewKind === 'video' && previewUrl && <Video className="recording-card__media" src={previewUrl} controls={false} muted loop autoPlay playsInline label={time} />}
        {previewKind === 'images' && frame && <Image className="recording-card__media" src={frame} alt="" fit="cover" />}
        <Box className="recording-card__check">
          <Checkbox checked={checked} disabled={disabled} onChange={() => onToggle(sessionKey)} ariaLabel={`Include the recording from ${time}`} />
        </Box>
        <Box className="recording-card__delete">
          <IconButton label={DELETE_LABEL} size="xs" variant="ghost" tone="danger" disabled={disabled} onClick={() => onDelete(sessionKey)}>
            <Icon name="trash-2" />
          </IconButton>
        </Box>
      </Box>
      <Box className="recording-card__meta">
        <Text variant="caption">{time}</Text>
        {sentAt !== null && <Tag>{SENT_LABEL}</Tag>}
      </Box>
    </Box>
  );
};

export { RecordingCard };
