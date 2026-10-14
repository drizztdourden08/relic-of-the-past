/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { RawCaptureFailureReason } from '@drizztdourden08/brock-input';
import { REASON_TEXT } from './RawAvailabilityNotice.constants';
import type { RawAvailabilityNoticeProps } from './RawAvailabilityNotice.type';
import './RawAvailabilityNotice.css';

const RawAvailabilityNotice = (props: RawAvailabilityNoticeProps) => {
  const { available, reason } = props;

  return (
    <Box className="hid-cal__raw-notice">
      {available
        ? 'Raw bytes available.'
        : `No raw bytes. ${reason && reason in REASON_TEXT ? REASON_TEXT[reason as RawCaptureFailureReason] : 'Reason unknown.'}`}
    </Box>
  );
};

export { RawAvailabilityNotice };
