/* @layer renderer-components @kind component */
/** States, plainly, whether this session captured raw HID bytes. */
import type { CSSProperties } from 'react';
import { Box, Text } from '@ds/primitives';
import type { RawCaptureFailureReason } from '@shared/ipc';

const S: Record<string, CSSProperties> = {
  box: { fontSize: 'var(--text-xs)', color: 'var(--c-text-muted)', margin: '0 0 var(--space-md)' },
};

const REASON_TEXT: Record<RawCaptureFailureReason, string> = {
  'unavailable-exclusive': 'Another application holds this controller.',
  'not-found': 'Not exposed to HID. Only positional can be captured.',
  error: 'The capture layer reported an error.',
};

interface RawAvailabilityNoticeProps {
  available: boolean;
  reason: string | null;
}

const RawAvailabilityNotice = (props: RawAvailabilityNoticeProps) => {
  const { available, reason } = props;

  return (
    <Box style={S.box}>
      {available
        ? 'Raw bytes available.'
        : `No raw bytes. ${reason && reason in REASON_TEXT ? REASON_TEXT[reason as RawCaptureFailureReason] : 'Reason unknown.'}`}
    </Box>
  );
};

export { RawAvailabilityNotice };
