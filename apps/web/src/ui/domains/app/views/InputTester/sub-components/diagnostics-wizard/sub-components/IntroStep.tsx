/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { IntroStepProps } from './diagnostics-steps.type';
import { HoldStatusLine } from './HoldStatusLine';

const IntroStep = (props: IntroStepProps) => {
  const { releaseStatus } = props;

  return (
    <>
      <Text as="p">
        This runs a full gamepad diagnostic in two passes: a byte-level capture, then a
        positional capture that asks for every input again once the controller reconnects
        normally. The last step lines both passes up side by side and lets you save or copy
        the result.
      </Text>
      <HoldStatusLine
        status={releaseStatus}
        pendingText="Releasing the hold on every controller..."
        doneText="The hold is dropped. Move on to pick which controller this run captures."
        errorText="Couldn't release the hold. The byte-capture step later in this run may stay empty."
      />
    </>
  );
};

export { IntroStep };
export type { IntroStepProps };
