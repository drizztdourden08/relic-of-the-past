/* @layer renderer-components @kind component */
/**
 * Stick calibration cards for the HID Calibration Wizard.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import type { InputItem, IdleRecordResult, StickSide } from '../hid-calibration.type';

interface StickCardsProps {
  items: InputItem[];
  activeStick: StickSide | null;
  stickBusy: boolean;
  stickLiveInfo: string;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  idleRecording: string | null;
  idleResults: Record<string, IdleRecordResult>;
  onStartCircle: (side: StickSide) => void;
  onStopCircle: () => void;
  onSkipStick: (side: StickSide) => void;
  onStickRedo: (side: StickSide) => void;
  onStickPickMode: (side: StickSide) => void;
  onConfirmPick: () => void;
  onCancelPick: () => void;
  onIdleRecord: (label: string, byteIndices: number[]) => void;
}

const StickCards = (props: StickCardsProps) => {
  const { items, activeStick, stickBusy, stickLiveInfo, stickPickMode, stickPickedBytes, idleRecording, idleResults, onStartCircle, onStopCircle, onSkipStick, onStickRedo, onStickPickMode, onConfirmPick, onCancelPick, onIdleRecord } = props;

  return (
    <Box className="hid-cal__prereqs">
      {(['left', 'right'] as const).map(side => {
        const label = side === 'left' ? 'LEFT' : 'RIGHT';
        const xId = side === 'left' ? 'leftX' : 'rightX';
        const yId = side === 'left' ? 'leftY' : 'rightY';
        const xItem = items.find(it => it.id === xId);
        const yItem = items.find(it => it.id === yId);
        const isDone = (xItem?.status === 'captured' || xItem?.status === 'skipped')
          && (yItem?.status === 'captured' || yItem?.status === 'skipped');
        const isActive = activeStick === side;
        const isPicking = isActive && stickPickMode;
        const isRecording = isActive && stickBusy && !stickPickMode;
        const otherBusy = activeStick !== null && activeStick !== side;

        return (
          <Box key={side} className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
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
            {!isActive && isDone && (
              <Text as="p" className="hid-cal__desc" style={{ fontSize: 10 }}>
                X: {xItem?.result ?? '—'}<Box as="br" />Y: {yItem?.result ?? '—'}
              </Text>
            )}

            <Box className="hid-cal__prereq-actions">
              {isPicking ? (
                <>
                  <Box as="button" onClick={onConfirmPick} disabled={stickPickedBytes.length === 0}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>
                    Confirm ({stickPickedBytes.length})
                  </Box>
                  <Box as="button" onClick={onCancelPick} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Cancel</Box>
                </>
              ) : isRecording ? (
                <Box as="button" onClick={onStopCircle} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Stop</Box>
              ) : isDone ? (
                <>
                  <Box as="button" onClick={() => onStickRedo(side)} disabled={otherBusy} className="input-cal__btn" style={{ fontSize: 11 }}>Redo</Box>
                  <Box
                    as="button"
                    disabled={idleRecording !== null}
                    className={`input-cal__btn${idleResults[`${label} Stick`] ? ' input-cal__btn--done' : ''}`}
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      const byteIndices: number[] = [];
                      if (xItem?.axisMapping) byteIndices.push(xItem.axisMapping.byteIndex);
                      if (yItem?.axisMapping) byteIndices.push(yItem.axisMapping.byteIndex);
                      if (byteIndices.length > 0) onIdleRecord(`${label} Stick`, byteIndices);
                    }}>
                    {idleRecording === `${label} Stick` ? 'Recording...' : idleResults[`${label} Stick`] ? '✓ Idle' : 'Idle'}
                  </Box>
                </>
              ) : (
                <>
                  <Box as="button" onClick={() => onStartCircle(side)} disabled={otherBusy}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Start</Box>
                  <Box as="button" onClick={() => onStickPickMode(side)} disabled={otherBusy}
                    className="input-cal__btn" style={{ fontSize: 11 }}>Pick</Box>
                  <Box as="button" onClick={() => onSkipStick(side)} disabled={otherBusy}
                    className="input-cal__btn" style={{ fontSize: 11 }}>Skip</Box>
                </>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export { StickCards };
