/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import trash2 from '@iconify-icons/lucide/trash-2';
import { Box } from '@ds/primitives/Box';
import { Checkbox } from '@ds/primitives/Checkbox';
import { Text } from '@ds/primitives/Text';
import { Button } from '@ds/primitives/Button';
import { Image } from '@ds/primitives/Image';
import { Video } from '@ds/primitives/Video';
import { useCyclingFrame } from '../behavior/useCyclingFrame';
import type { CaptureSessionRowProps } from '../CaptureSessionPicker.type';
import '../CaptureSessionPicker.css';

// Stable reference for a row with no frames to cycle, so useCyclingFrame never sees a fresh
// array literal on every render.
const NO_PREVIEW_FRAMES: string[] = [];

const formatTimestamp = (epochMs: number): string =>
  new Date(epochMs).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/** One recorded session: checkbox, a tiny preview (a looping video, or a cycling slideshow of
 *  the packaged PNG frames when there's no ffmpeg to encode one), its timestamp, a "Sent" tag
 *  once it's shipped in an earlier report, and a delete button. Purely presentational - the
 *  checked/deleted/confirmed decisions all come back up through callbacks. */
const CaptureSessionRow = (props: CaptureSessionRowProps) => {
  const { session, checked, onToggle, onRequestDelete } = props;
  const cyclingFrameUrl = useCyclingFrame(session.previewKind === 'images' ? session.previewFrameUrls : NO_PREVIEW_FRAMES);

  return (
    <Box className="capture-session-row">
      <Checkbox
        checked={checked}
        onChange={() => onToggle(session.sessionKey)}
        ariaLabel={`Include recording from ${formatTimestamp(session.startedAt)}`}
      />
      <Box className="capture-session-row__preview">
        {session.previewKind === 'video' && session.previewUrl && (
          <Video className="capture-session-row__media" src={session.previewUrl} muted loop autoPlay playsInline />
        )}
        {session.previewKind === 'images' && cyclingFrameUrl && (
          <Image className="capture-session-row__media" src={cyclingFrameUrl} alt="" />
        )}
        {session.previewKind === 'none' && <Box className="capture-session-row__no-preview" />}
      </Box>
      <Box className="capture-session-row__meta">
        <Text className="capture-session-row__time">{formatTimestamp(session.startedAt)}</Text>
        {session.sentAt != null && <Text className="capture-session-row__tag">Sent</Text>}
      </Box>
      <Button
        variant="bare"
        className="capture-session-row__delete"
        onClick={() => onRequestDelete(session.sessionKey)}
        title="Delete recording"
      >
        <IconifyIcon icon={trash2} width={14} height={14} />
      </Button>
    </Box>
  );
};

export { CaptureSessionRow };
