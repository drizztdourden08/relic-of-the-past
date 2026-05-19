/**
 * Button and axis mapping grid for the HID Calibration Wizard.
 */
import type { AxisSubStep, CaptureState, InputItem } from '../types';
import { STICK_IDS, TRIGGER_IDS } from '../constants';

interface ButtonMappingProps {
  items: InputItem[];
  buttonItems: InputItem[];
  buttonCapturedCount: number;
  activeIndex: number;
  inputPhaseActive: boolean;
  autoAdvance: boolean;
  captureState: CaptureState;
  axisSubStep: AxisSubStep;
  instruction: string;
  prereqsDone: boolean;
  onStartButtons: () => void;
  onSkip: () => void;
  onGoBack: () => void;
  onClickItem: (idx: number) => void;
  onClearItem: (idx: number) => void;
  setAutoAdvanceWrapped: (v: boolean) => void;
  setInputPhaseActiveWrapped: (v: boolean) => void;
}

const ButtonMapping = (props: ButtonMappingProps) => {
  const {
    items, buttonItems, buttonCapturedCount, activeIndex, inputPhaseActive, autoAdvance,
    captureState, axisSubStep, instruction, prereqsDone,
    onStartButtons, onSkip, onGoBack, onClickItem, onClearItem,
    setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
  } = props;

  if (!prereqsDone) return null;

  return (
    <div className="hid-cal__step">
      <div className="hid-cal__step-title">
        4. Button & Axis Mapping — {buttonCapturedCount}/{buttonItems.length}
      </div>

      {inputPhaseActive && (
        <div className="hid-cal__instruction">
          {instruction}
          {items[activeIndex]?.kind === 'axis' && captureState === 'waiting-press' && (
            <span className="hid-cal__axis-sub">
              [{axisSubStep === 'pos' ? '1/2 positive' : '2/2 negative'}]
            </span>
          )}
        </div>
      )}

      <div className="hid-cal__input-grid">
        {items.map((item, i) => {
          if (STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return null;
          const isActive = i === activeIndex && inputPhaseActive;
          const icon = item.status === 'captured' ? '✓' : item.status === 'skipped' ? '⊘' : item.status === 'active' ? '►' : '·';
          const canClear = item.status === 'captured' || item.status === 'skipped';
          return (
            <div key={item.id}
              className={`hid-cal__input-item hid-cal__input-item--${item.status}${isActive ? ' hid-cal__input-item--focus' : ''}`}
              style={{ cursor: prereqsDone ? 'pointer' : 'default' }}>
              <span className="hid-cal__input-icon" onClick={() => prereqsDone && onClickItem(i)}>{icon}</span>
              <span className="hid-cal__input-name" onClick={() => prereqsDone && onClickItem(i)}>{item.label}{item.kind === 'axis' ? ' 🕹️' : ''}</span>
              {item.result && <span className="hid-cal__input-result">{item.result}</span>}
              {canClear && (
                <button className="hid-cal__input-clear" title={`Clear ${item.label}`}
                  onClick={(e) => { e.stopPropagation(); onClearItem(i); }}>×</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="hid-cal__prereq-actions">
        {!inputPhaseActive ? (
          <button onClick={onStartButtons} className="input-cal__btn input-cal__btn--primary">
            Auto-Advance All
          </button>
        ) : autoAdvance ? (
          <>
            <button onClick={onGoBack} disabled={activeIndex <= 0} className="input-cal__btn">← Back</button>
            <button onClick={onSkip} className="input-cal__btn">Skip</button>
            <button onClick={() => setAutoAdvanceWrapped(false)} className="input-cal__btn">Stop Auto</button>
            <button onClick={() => setInputPhaseActiveWrapped(false)} className="input-cal__btn">Pause</button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              Click a button above to detect, or click a byte in the grid to assign manually.
            </span>
            <button onClick={() => setInputPhaseActiveWrapped(false)} className="input-cal__btn">Deselect</button>
          </>
        )}
      </div>
    </div>
  );
};

export { ButtonMapping };
