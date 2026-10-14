/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Icon } from '@drizztdourden08/tessera/primitives';
import { StickCardActions } from './StickCardActions';
import { StickCardStatus } from './StickCardStatus';
import { deriveStickCardState } from './stick-card-state';
import type { StickCardProps } from './StickCards.type';
import './StickCard.css';

const firstWord = (text: string | undefined): string => (text ? text.split(' ')[0] ?? '' : '');

const StickCard = (props: StickCardProps) => {
  const { side, stickLiveInfo, stickPickedBytes, onStartCircle, onStopCircle, onSkipStick, onStickRedo, onStickIdle, onStickPickMode, onConfirmPick, onCancelPick } = props;
  const readIdle = useCallback(() => onStickIdle(side), [onStickIdle, side]);
  const redo = useCallback(() => onStickRedo(side), [onStickRedo, side]);
  const start = useCallback(() => onStartCircle(side), [onStartCircle, side]);
  const pick = useCallback(() => onStickPickMode(side), [onStickPickMode, side]);
  const skip = useCallback(() => onSkipStick(side), [onSkipStick, side]);
  const state = deriveStickCardState(props);
  const { isDone, label, xItem, yItem } = state;

  return (
    <Box className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
      <Box className="hid-cal__prereq-title">
        <Text>{isDone ? <Icon name="check" /> : '3.'} {label} Stick</Text>
        {isDone && <Text className="hid-cal__prereq-badge">
          {firstWord(xItem?.result)} {firstWord(yItem?.result)}
        </Text>}
      </Box>
      <StickCardStatus state={state} stickLiveInfo={stickLiveInfo} stickPickedBytes={stickPickedBytes} />
      <StickCardActions
        state={state}
        pickedCount={stickPickedBytes.length}
        onConfirmPick={onConfirmPick}
        onCancelPick={onCancelPick}
        onStopCircle={onStopCircle}
        onReadIdle={readIdle}
        onRedo={redo}
        onStart={start}
        onPick={pick}
        onSkip={skip}
      />
    </Box>
  );
};

export { StickCard };
