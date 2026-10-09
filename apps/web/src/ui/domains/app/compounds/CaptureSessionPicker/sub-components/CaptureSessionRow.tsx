/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import trash2 from '@iconify-icons/lucide/trash-2';
import { Box, Checkbox, Text, Button, Image } from '@drizztdourden08/tessera/primitives';
import { Video } from '@drizztdourden08/tessera/composites';
import { useCyclingFrame } from '../behavior/useCyclingFrame';
import type { CaptureSessionRowProps } from '../CaptureSessionPicker.type';
import { NO_PREVIEW_FRAMES } from './CaptureSessionRow.constants';
import './CaptureSessionRow.css';

const formatTimestamp = (epochMs: number): string =>
  new Date(epochMs).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const CaptureSessionRow = (props: CaptureSessionRowProps) => {
  const { session, checked, onToggle, onRequestDelete } = props;
  const cyclingFrameUrl = useCyclingFrame(session.previewKind === 'images' ? session.previewFrameUrls : NO_PREVIEW_FRAMES);

  return (
    <Box className="capture-session-row">
      <Box className="capture-session-row__preview" onClick={() => onToggle(session.sessionKey)}>
        {session.previewKind === 'video' && session.previewUrl && (
          <Video className="capture-session-row__media" src={session.previewUrl} muted loop autoPlay playsInline />
        )}
        {session.previewKind === 'images' && cyclingFrameUrl && (
          <Image className="capture-session-row__media" src={cyclingFrameUrl} alt="" />
        )}
        {session.previewKind === 'none' && <Box className="capture-session-row__no-preview" />}

        <Box className="capture-session-row__checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={checked}
            onChange={() => onToggle(session.sessionKey)}
            ariaLabel={`Include recording from ${formatTimestamp(session.startedAt)}`}
          />
        </Box>
        <Button
          variant="bare"
          className="capture-session-row__delete"
          onClick={(e) => { e.stopPropagation(); onRequestDelete(session.sessionKey); }}
          title="Delete recording"
        >
          <IconifyIcon icon={trash2} width={14} height={14} />
        </Button>
      </Box>
      <Box className="capture-session-row__meta">
        <Text className="capture-session-row__time">{formatTimestamp(session.startedAt)}</Text>
        {session.sentAt != null && <Text className="capture-session-row__tag">Sent</Text>}
      </Box>
    </Box>
  );
};

export { CaptureSessionRow };
