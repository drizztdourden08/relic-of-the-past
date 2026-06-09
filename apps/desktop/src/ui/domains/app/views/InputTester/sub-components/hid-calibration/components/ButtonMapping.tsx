/* @layer renderer-components @kind component */
/**
 * Button and axis mapping grid for the HID Calibration Wizard.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import type { AxisSubStep, CaptureState, InputItem } from '../hid-calibration.type';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';

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
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title">
        4. Button & Axis Mapping — {buttonCapturedCount}/{buttonItems.length}
      </Box>

      {inputPhaseActive && (
        <Box className="hid-cal__instruction">
          {instruction}
          {items[activeIndex]?.kind === 'axis' && captureState === 'waiting-press' && (
            <Text className="hid-cal__axis-sub">
              [{axisSubStep === 'pos' ? '1/2 positive' : '2/2 negative'}]
            </Text>
          )}
        </Box>
      )}

      <Box className="hid-cal__input-grid">
        {items.map((item, i) => {
          if (STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return null;
          const isActive = i === activeIndex && inputPhaseActive;
          const icon = item.status === 'captured' ? '✓' : item.status === 'skipped' ? '⊘' : item.status === 'active' ? '►' : '·';
          const canClear = item.status === 'captured' || item.status === 'skipped';
          return (
            <Box key={item.id}
              className={`hid-cal__input-item hid-cal__input-item--${item.status}${isActive ? ' hid-cal__input-item--focus' : ''}`}
              style={{ cursor: prereqsDone ? 'pointer' : 'default' }}>
              <Text className="hid-cal__input-icon" onClick={() => prereqsDone && onClickItem(i)}>{icon}</Text>
              <Text className="hid-cal__input-name" onClick={() => prereqsDone && onClickItem(i)}>{item.label}{item.kind === 'axis' ? ' 🕹️' : ''}</Text>
              {item.result && <Text className="hid-cal__input-result">{item.result}</Text>}
              {canClear && (
                <Box as="button" className="hid-cal__input-clear" title={`Clear ${item.label}`}
                  onClick={(e) => { e.stopPropagation(); onClearItem(i); }}>×</Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box className="hid-cal__prereq-actions">
        {!inputPhaseActive ? (
          <Box as="button" onClick={onStartButtons} className="input-cal__btn input-cal__btn--primary">
            Auto-Advance All
          </Box>
        ) : autoAdvance ? (
          <>
            <Box as="button" onClick={onGoBack} disabled={activeIndex <= 0} className="input-cal__btn">← Back</Box>
            <Box as="button" onClick={onSkip} className="input-cal__btn">Skip</Box>
            <Box as="button" onClick={() => setAutoAdvanceWrapped(false)} className="input-cal__btn">Stop Auto</Box>
            <Box as="button" onClick={() => setInputPhaseActiveWrapped(false)} className="input-cal__btn">Pause</Box>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 11, color: 'var(--c-text-dim)' }}>
              Click a button above to detect, or click a byte in the grid to assign manually.
            </Text>
            <Box as="button" onClick={() => setInputPhaseActiveWrapped(false)} className="input-cal__btn">Deselect</Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export { ButtonMapping };
