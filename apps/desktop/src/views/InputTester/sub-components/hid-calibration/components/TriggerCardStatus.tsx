/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { TriggerCardStatusProps } from './TriggerCards.type';

const TriggerCardStatus = (props: TriggerCardStatusProps) => {
  const { state, triggerLiveInfo, triggerPickedByte } = props;
  const { item, isPicking, isRecording, isActive, isDone } = state;

  return (
    <>
      {isPicking && (
        <Text as="p" className="hid-cal__desc">
          Click 1 byte box below, then Confirm. [{triggerPickedByte ?? '-'}]
        </Text>
      )}
      {isRecording && triggerLiveInfo && <Box className="hid-cal__stick-info">{triggerLiveInfo}</Box>}
      {isRecording && !triggerLiveInfo && <Text as="p" className="hid-cal__desc">Press the trigger fully and release...</Text>}
      {!isActive && isDone && (
        <Text as="p" className="hid-cal__desc hid-cal__trigger-result">{item.result ?? '-'}</Text>
      )}
    </>
  );
};

export { TriggerCardStatus };
