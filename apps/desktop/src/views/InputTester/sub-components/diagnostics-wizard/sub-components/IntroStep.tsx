/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { IntroStepProps } from './diagnostics-steps.type';
import { HoldStatusLine } from './HoldStatusLine';

const IntroStep = (props: IntroStepProps) => {
  const { releaseStatus } = props;

  return (
    <>
      <Text as="p">Captures every input twice: raw bytes, then by position.</Text>
      <HoldStatusLine
        status={releaseStatus}
        pendingText="Releasing the controllers..."
        doneText="Controllers released."
        errorText="Could not release the controllers. Byte capture may stay empty."
      />
    </>
  );
};

export { IntroStep };
