/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { ITEM_STYLE, MANUAL_HINT } from './ButtonMapping.constants';
import type { ButtonMappingProps } from './ButtonMapping.type';

const ButtonMapping = (props: ButtonMappingProps) => {
  const {
    items, buttonItems, buttonCapturedCount, activeIndex, inputPhaseActive, autoAdvance,
    captureState, axisSubStep, instruction, prereqsDone,
    onStartButtons, onSkip, onGoBack, onClickItem, onClearItem,
    setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
    stepTitle = `4. Button & Axis Mapping (${buttonCapturedCount}/${buttonItems.length})`,
    includeStickTriggerIds = false, showAxisSubStep = true,
  } = props;
  const stopAuto = useCallback(() => setAutoAdvanceWrapped(false), [setAutoAdvanceWrapped]);
  const pauseInput = useCallback(() => setInputPhaseActiveWrapped(false), [setInputPhaseActiveWrapped]);

  if (!prereqsDone) return null;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title">
        {stepTitle}
      </Box>

      {inputPhaseActive && (
        <Box className="hid-cal__instruction">
          {instruction}
          {showAxisSubStep && items[activeIndex]?.kind === 'axis' && captureState === 'waiting-press' && (
            <Text className="hid-cal__axis-sub">
              [{axisSubStep === 'pos' ? '1/2 positive' : '2/2 negative'}]
            </Text>
          )}
        </Box>
      )}

      <Box className="hid-cal__input-grid">
        {items.map((item, i) => {
          if (!includeStickTriggerIds && (STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id))) return null;
          const isActive = i === activeIndex && inputPhaseActive;
          const icon = item.status === 'captured' ? '✓' : item.status === 'skipped' ? '⊘' : item.status === 'active' ? '►' : '·';
          const canClear = item.status === 'captured' || item.status === 'skipped';
          return (
            <Box key={item.id}
              className={`hid-cal__input-item hid-cal__input-item--${item.status}${isActive ? ' hid-cal__input-item--focus' : ''}`}
              style={ITEM_STYLE}>
              <Text className="hid-cal__input-icon" onClick={() => prereqsDone && onClickItem(i)}>{icon}</Text>
              <Text className="hid-cal__input-name" onClick={() => prereqsDone && onClickItem(i)}>{item.label}{item.kind === 'axis' ? ' 🕹️' : ''}</Text>
              {item.result && <Text className="hid-cal__input-result">{item.result}</Text>}
              {canClear && (
                <Button variant="bare" className="hid-cal__input-clear" title={`Clear ${item.label}`}
                  onClick={(e) => { e.stopPropagation(); onClearItem(i); }}>×</Button>
              )}
            </Box>
          );
        })}
      </Box>

      <Box className="hid-cal__prereq-actions">
        {!inputPhaseActive ? (
          <Button variant="primary" size="sm" onClick={onStartButtons}>
            Auto-Advance All
          </Button>
        ) : autoAdvance ? (
          <>
            <Button variant="tertiary" size="sm" onClick={onGoBack} disabled={activeIndex <= 0}>← Back</Button>
            <Button variant="tertiary" size="sm" onClick={onSkip}>Skip</Button>
            <Button variant="tertiary" size="sm" onClick={stopAuto}>Stop Auto</Button>
            <Button variant="tertiary" size="sm" onClick={pauseInput}>Pause</Button>
          </>
        ) : (
          <>
            <Text style={MANUAL_HINT}>
              Click a button above to detect, or click a byte in the grid to assign manually.
            </Text>
            <Button variant="tertiary" size="sm" onClick={pauseInput}>Deselect</Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export { ButtonMapping };
