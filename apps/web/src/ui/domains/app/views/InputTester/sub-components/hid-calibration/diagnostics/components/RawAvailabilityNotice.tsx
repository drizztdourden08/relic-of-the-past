/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { RawCaptureFailureReason } from '@shared/ipc';
import { REASON_TEXT } from './RawAvailabilityNotice.constants';
import type { RawAvailabilityNoticeProps } from './RawAvailabilityNotice.type';

const S: Record<string, CSSProperties> = {
  box: { fontSize: 'var(--text-xs)', color: 'var(--c-text-muted)', margin: '0 0 var(--space-md)' },
};

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
