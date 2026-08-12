/* @layer renderer-components @kind component */
/** Async status line for a hold release/restore transition: a spinner while
 *  the native call is in flight, then a settled state once it resolves. */
import { Box, Spinner, Text } from '@ds/primitives';
import type { HoldTransitionStatus } from '../behavior/useHoldTransition';

interface HoldStatusLineProps {
  status: HoldTransitionStatus;
  pendingText: string;
  doneText: string;
  errorText: string;
}

const HoldStatusLine = (props: HoldStatusLineProps) => {
  const { status, pendingText, doneText, errorText } = props;

  return (
    <Box className="diagnostics-wizard__hold-status">
      {status === 'pending' && <Spinner size="sm" />}
      <Text className={`diagnostics-wizard__hold-status-text diagnostics-wizard__hold-status-text--${status}`}>
        {status === 'pending' ? pendingText : status === 'done' ? doneText : errorText}
      </Text>
    </Box>
  );
};

export { HoldStatusLine };
export type { HoldStatusLineProps };
