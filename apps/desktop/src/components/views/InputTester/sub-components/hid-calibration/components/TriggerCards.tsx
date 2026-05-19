/**
 * Trigger calibration cards for the HID Calibration Wizard.
 */
import type { InputItem, IdleRecordResult, TriggerSide } from '../types';
import { TRIGGER_IDS } from '../constants';

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
    <div className="hid-cal__prereqs">
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
          <div key={side} className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
            <div className="hid-cal__prereq-title">
              <span>{isDone ? '✓' : '⊳'} {label}</span>
              {isDone && item.result && <span className="hid-cal__prereq-badge">{item.result.split(' ')[0]}</span>}
            </div>

            {isPicking && (
              <p className="hid-cal__desc">
                Click 1 byte box below, then Confirm. [{triggerPickedByte ?? '—'}]
              </p>
            )}
            {isRecording && triggerLiveInfo && <div className="hid-cal__stick-info">{triggerLiveInfo}</div>}
            {isRecording && !triggerLiveInfo && <p className="hid-cal__desc">Press the trigger fully and release...</p>}
            {!isActive && isDone && (
              <p className="hid-cal__desc" style={{ fontSize: 10 }}>{item.result ?? '—'}</p>
            )}

            <div className="hid-cal__prereq-actions">
              {isPicking ? (
                <>
                  <button onClick={onConfirmTriggerPick} disabled={triggerPickedByte === null}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Confirm</button>
                  <button onClick={onCancelTriggerPick} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Cancel</button>
                </>
              ) : isRecording ? (
                <button onClick={onStopTrigger} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Stop</button>
              ) : isDone ? (
                <>
                  <button onClick={() => onTriggerRedo(side)} disabled={otherBusy} className="input-cal__btn" style={{ fontSize: 11 }}>Redo</button>
                  <button
                    disabled={idleRecording !== null}
                    className={`input-cal__btn${idleResults[label] ? ' input-cal__btn--done' : ''}`}
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      const byteIndices: number[] = [];
                      if (item?.axisMapping) byteIndices.push(item.axisMapping.byteIndex);
                      if (byteIndices.length > 0) onIdleRecord(label, byteIndices);
                    }}>
                    {idleRecording === label ? 'Recording...' : idleResults[label] ? '✓ Idle' : 'Idle'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => onStartTrigger(side)} disabled={otherBusy}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Start</button>
                  <button onClick={() => onTriggerPickMode(side)} disabled={otherBusy}
                    className="input-cal__btn" style={{ fontSize: 11 }}>Pick</button>
                  <button onClick={() => onSkipTrigger(side)} disabled={otherBusy}
                    className="input-cal__btn" style={{ fontSize: 11 }}>Skip</button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { TriggerCards };
