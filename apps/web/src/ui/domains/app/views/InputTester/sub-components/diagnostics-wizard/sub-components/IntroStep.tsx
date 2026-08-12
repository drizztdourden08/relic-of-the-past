/* @layer renderer-components @kind component */
/** Step 1: explains the run and shuts SDL's gamepad backend down right
 *  here, before any device list is shown, so step 2 lists a controller only
 *  through the raw HID enumeration or the SDL snapshot taken just before
 *  this release fires. Next and Back stay disabled in the dialog's footer
 *  until this status line reaches done. */
import { Text } from '@ds/primitives';
import type { HoldTransitionStatus } from '../behavior/useHoldTransition';
import { HoldStatusLine } from './HoldStatusLine';

interface IntroStepProps {
  releaseStatus: HoldTransitionStatus;
}

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
        pendingText="Releasing the hold on every controller…"
        doneText="The hold is dropped. Move on to pick which controller this run captures."
        errorText="Couldn't release the hold. The byte-capture step later in this run may stay empty."
      />
    </>
  );
};

export { IntroStep };
export type { IntroStepProps };
