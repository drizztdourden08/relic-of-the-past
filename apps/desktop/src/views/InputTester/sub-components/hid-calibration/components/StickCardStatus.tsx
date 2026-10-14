/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { StickCardResult } from './StickCardResult';
import type { StickCardStatusProps } from './StickCards.type';

const StickCardStatus = (props: StickCardStatusProps) => {
  const { state, stickLiveInfo, stickPickedBytes } = props;
  const { isPicking, isRecording, isActive, needsIdle, isDone, xItem, yItem } = state;

  return (
    <>
      {isPicking && (
        <Text as="p" className="hid-cal__desc">
          Click 1-2 byte boxes below, then Confirm. [{stickPickedBytes.join(', ')}]
        </Text>
      )}
      {isRecording && stickLiveInfo && <Box className="hid-cal__stick-info">{stickLiveInfo}</Box>}
      {isRecording && !stickLiveInfo && <Text as="p" className="hid-cal__desc">Rotate slowly in a full circle...</Text>}
      {!isActive && needsIdle && (
        <Text as="p" className="hid-cal__stick-idle-prompt">
          Bytes found. Let go of the stick, then read its resting position.
        </Text>
      )}
      {!isActive && isDone && <StickCardResult xItem={xItem} yItem={yItem} />}
    </>
  );
};

export { StickCardStatus };
