/* @layer renderer-components @kind component */
/**
 * Trigger calibration cards for the HID Calibration Wizard.
 */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { Button } from '../../../../../../../design-system/primitives/Button';
import type { InputItem, IdleRecordResult, TriggerSide } from '../hid-calibration.type';
import { TRIGGER_IDS } from '../hid-calibration.constants';

const DESC_SMALL: CSSProperties = { fontSize: 10 };

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
              <Text as="p" className="hid-cal__desc" style={DESC_SMALL}>{item.result ?? '—'}</Text>
            )}

            <Box className="hid-cal__prereq-actions">
              {isPicking ? (
                <>
                  <Button variant="primary" size="sm" onClick={onConfirmTriggerPick} disabled={triggerPickedByte === null}>Confirm</Button>
                  <Button variant="danger" size="sm" onClick={onCancelTriggerPick}>Cancel</Button>
                </>
              ) : isRecording ? (
                <Button variant="danger" size="sm" onClick={onStopTrigger}>Stop</Button>
              ) : isDone ? (
                <>
                  <Button variant="tertiary" size="sm" onClick={() => onTriggerRedo(side)} disabled={otherBusy}>Redo</Button>
                  <Button
                    variant="tertiary"
                    size="sm"
                    disabled={idleRecording !== null}
                    className={idleResults[label] ? 'input-cal__btn--done' : ''}
                    onClick={() => {
                      const byteIndices: number[] = [];
                      if (item?.axisMapping) byteIndices.push(item.axisMapping.byteIndex);
                      if (byteIndices.length > 0) onIdleRecord(label, byteIndices);
                    }}>
                    {idleRecording === label ? 'Recording...' : idleResults[label] ? '✓ Idle' : 'Idle'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={() => onStartTrigger(side)} disabled={otherBusy}>Start</Button>
                  <Button variant="tertiary" size="sm" onClick={() => onTriggerPickMode(side)} disabled={otherBusy}>Pick</Button>
                  <Button variant="tertiary" size="sm" onClick={() => onSkipTrigger(side)} disabled={otherBusy}>Skip</Button>
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
