/* @layer renderer-components @kind component */
/**
 * Trigger calibration cards for the HID Calibration Wizard.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import type { InputItem, IdleRecordResult, TriggerSide } from '../hid-calibration.type';
import { TRIGGER_IDS } from '../hid-calibration.constants';

interface TriggerCardsProps {
  items: InputItem[];
  activeTrigger: TriggerSide | null;
  triggerBusy: boolean;
  triggerLiveInfo: string;
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  idleRecording: string | null;
  idleResults: Record<string, IdleRecordResult>;
  onStartTrigger: (side: TriggerSide) => void;
  onStopTrigger: () => void;
  onSkipTrigger: (side: TriggerSide) => void;
  onTriggerRedo: (side: TriggerSide) => void;
  onTriggerPickMode: (side: TriggerSide) => void;
  onConfirmTriggerPick: () => void;
  onCancelTriggerPick: () => void;
  onIdleRecord: (label: string, byteIndices: number[]) => void;
}

const TriggerCards = (props: TriggerCardsProps) => {
  const { items, activeTrigger, triggerBusy, triggerLiveInfo, triggerPickMode, triggerPickedByte, idleRecording, idleResults, onStartTrigger, onStopTrigger, onSkipTrigger, onTriggerRedo, onTriggerPickMode, onConfirmTriggerPick, onCancelTriggerPick, onIdleRecord } = props;

  if (!items.some(it => TRIGGER_IDS.has(it.id))) return null;

  return (
    <Box className="hid-cal__prereqs">
      {(['left', 'right'] as const).map(side => {
        const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
        const item = items.find(it => it.id === axisId);
        if (!item) return null;
        const label = item.label;
        const isDone = item.status === 'captured' || item.status === 'skipped';
        const isActive = activeTrigger === side;
        const isPicking = isActive && triggerPickMode;
        const isRecording = isActive && triggerBusy && !triggerPickMode;
        const otherBusy = activeTrigger !== null && activeTrigger !== side;

        return (
          <Box key={side} className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
            <Box className="hid-cal__prereq-title">
              <Text>{isDone ? '✓' : '⊳'} {label}</Text>
              {isDone && item.result && <Text className="hid-cal__prereq-badge">{item.result.split(' ')[0]}</Text>}
            </Box>

            {isPicking && (
              <Text as="p" className="hid-cal__desc">
                Click 1 byte box below, then Confirm. [{triggerPickedByte ?? '—'}]
              </Text>
            )}
            {isRecording && triggerLiveInfo && <Box className="hid-cal__stick-info">{triggerLiveInfo}</Box>}
            {isRecording && !triggerLiveInfo && <Text as="p" className="hid-cal__desc">Press the trigger fully and release...</Text>}
            {!isActive && isDone && (
              <Text as="p" className="hid-cal__desc" style={{ fontSize: 10 }}>{item.result ?? '—'}</Text>
            )}

            <Box className="hid-cal__prereq-actions">
              {isPicking ? (
                <>
                  <Box as="button" onClick={onConfirmTriggerPick} disabled={triggerPickedByte === null}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Confirm</Box>
                  <Box as="button" onClick={onCancelTriggerPick} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Cancel</Box>
                </>
              ) : isRecording ? (
                <Box as="button" onClick={onStopTrigger} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Stop</Box>
              ) : isDone ? (
                <>
                  <Box as="button" onClick={() => onTriggerRedo(side)} disabled={otherBusy} className="input-cal__btn" style={{ fontSize: 11 }}>Redo</Box>
                  <Box
                    as="button"
                    disabled={idleRecording !== null}
                    className={`input-cal__btn${idleResults[label] ? ' input-cal__btn--done' : ''}`}
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      const byteIndices: number[] = [];
                      if (item?.axisMapping) byteIndices.push(item.axisMapping.byteIndex);
                      if (byteIndices.length > 0) onIdleRecord(label, byteIndices);
                    }}>
                    {idleRecording === label ? 'Recording...' : idleResults[label] ? '✓ Idle' : 'Idle'}
                  </Box>
                </>
              ) : (
                <>
                  <Box as="button" onClick={() => onStartTrigger(side)} disabled={otherBusy}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Start</Box>
                  <Box as="button" onClick={() => onTriggerPickMode(side)} disabled={otherBusy}
                    className="input-cal__btn" style={{ fontSize: 11 }}>Pick</Box>
                  <Box as="button" onClick={() => onSkipTrigger(side)} disabled={otherBusy}
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

export { TriggerCards };
