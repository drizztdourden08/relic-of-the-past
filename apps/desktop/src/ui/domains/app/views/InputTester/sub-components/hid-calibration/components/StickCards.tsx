/* @layer renderer-components @kind component */
/**
 * Stick calibration cards for the HID Calibration Wizard.
 */
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
    <div className="hid-cal__prereqs">
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
          <div key={side} className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
            <div className="hid-cal__prereq-title">
              <span>{isDone ? '✓' : '3.'} {label} Stick</span>
              {isDone && <span className="hid-cal__prereq-badge">
                {xItem?.result ? xItem.result.split(' ')[0] : ''} {yItem?.result ? yItem.result.split(' ')[0] : ''}
              </span>}
            </div>

            {isPicking && (
              <p className="hid-cal__desc">
                Click 1-2 byte boxes below, then Confirm. [{stickPickedBytes.join(', ')}]
              </p>
            )}
            {isRecording && stickLiveInfo && <div className="hid-cal__stick-info">{stickLiveInfo}</div>}
            {isRecording && !stickLiveInfo && <p className="hid-cal__desc">Rotate slowly in a full circle...</p>}
            {!isActive && isDone && (
              <p className="hid-cal__desc" style={{ fontSize: 10 }}>
                X: {xItem?.result ?? '—'}<br/>Y: {yItem?.result ?? '—'}
              </p>
            )}

            <div className="hid-cal__prereq-actions">
              {isPicking ? (
                <>
                  <button onClick={onConfirmPick} disabled={stickPickedBytes.length === 0}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>
                    Confirm ({stickPickedBytes.length})
                  </button>
                  <button onClick={onCancelPick} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Cancel</button>
                </>
              ) : isRecording ? (
                <button onClick={onStopCircle} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>Stop</button>
              ) : isDone ? (
                <>
                  <button onClick={() => onStickRedo(side)} disabled={otherBusy} className="input-cal__btn" style={{ fontSize: 11 }}>Redo</button>
                  <button
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
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => onStartCircle(side)} disabled={otherBusy}
                    className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Start</button>
                  <button onClick={() => onStickPickMode(side)} disabled={otherBusy}
                    className="input-cal__btn" style={{ fontSize: 11 }}>Pick</button>
                  <button onClick={() => onSkipStick(side)} disabled={otherBusy}
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

export { StickCards };
