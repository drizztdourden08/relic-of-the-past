/* @layer renderer-components @kind component */
import { Box, Spinner, Text } from '@ds/primitives';
import type { HoldStatusLineProps } from './diagnostics-steps.type';

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
