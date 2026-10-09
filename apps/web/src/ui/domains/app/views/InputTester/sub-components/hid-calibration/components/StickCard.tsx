/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { Button } from '../../../../../../../design-system/primitives/Button';
import { DESC_SMALL } from './StickCards.constants';
import type { StickCardProps } from './StickCards.type';

const StickCard = (props: StickCardProps) => {
  const { side, items, activeStick, stickBusy, stickLiveInfo, stickPickMode, stickPickedBytes, onStartCircle, onStopCircle, onSkipStick, onStickRedo, onStickIdle, onStickPickMode, onConfirmPick, onCancelPick } = props;
  const readIdle = useCallback(() => onStickIdle(side), [onStickIdle, side]);
  const redo = useCallback(() => onStickRedo(side), [onStickRedo, side]);
  const start = useCallback(() => onStartCircle(side), [onStartCircle, side]);
  const pick = useCallback(() => onStickPickMode(side), [onStickPickMode, side]);
  const skip = useCallback(() => onSkipStick(side), [onSkipStick, side]);

  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const xId = side === 'left' ? 'leftX' : 'rightX';
  const yId = side === 'left' ? 'leftY' : 'rightY';
  const xItem = items.find(it => it.id === xId);
  const yItem = items.find(it => it.id === yId);
  const isMapped = (xItem?.status === 'captured' || xItem?.status === 'skipped')
    && (yItem?.status === 'captured' || yItem?.status === 'skipped');
  const hasIdle = xItem?.axisMapping?.idle != null;
  const needsIdle = isMapped && !hasIdle;
  const isDone = isMapped && hasIdle;
  const isActive = activeStick === side;
  const isPicking = isActive && stickPickMode;
  const isRecording = isActive && stickBusy && !stickPickMode;
  const otherBusy = activeStick !== null && activeStick !== side;

  return (
    <Box className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
      <Box className="hid-cal__prereq-title">
        <Text>{isDone ? '✓' : '3.'} {label} Stick</Text>
        {isDone && <Text className="hid-cal__prereq-badge">
          {xItem?.result ? xItem.result.split(' ')[0] : ''} {yItem?.result ? yItem.result.split(' ')[0] : ''}
        </Text>}
      </Box>

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
      {!isActive && isDone && (
        <Text as="p" className="hid-cal__desc" style={DESC_SMALL}>
          X: {xItem?.result ?? '-'}<Box as="br" />Y: {yItem?.result ?? '-'}
        </Text>
      )}

      <Box className="hid-cal__prereq-actions">
        {isPicking ? (
          <>
            <Button variant="primary" size="sm" onClick={onConfirmPick} disabled={stickPickedBytes.length === 0}>
              Confirm ({stickPickedBytes.length})
            </Button>
            <Button variant="danger" size="sm" onClick={onCancelPick}>Cancel</Button>
          </>
        ) : isRecording ? (
          <Button variant="danger" size="sm" onClick={onStopCircle}>Stop</Button>
        ) : needsIdle ? (
          <>
            <Button variant="primary" size="sm" onClick={readIdle} disabled={otherBusy}>
              Read idle position
            </Button>
            <Button variant="tertiary" size="sm" onClick={redo} disabled={otherBusy}>Redo</Button>
          </>
        ) : isDone ? (
          <>
            <Button variant="tertiary" size="sm" onClick={redo} disabled={otherBusy}>Redo</Button>
          </>
        ) : (
          <>
            <Button variant="primary" size="sm" onClick={start} disabled={otherBusy}>Start</Button>
            <Button variant="tertiary" size="sm" onClick={pick} disabled={otherBusy}>Pick</Button>
            <Button variant="tertiary" size="sm" onClick={skip} disabled={otherBusy}>Skip</Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export { StickCard };
