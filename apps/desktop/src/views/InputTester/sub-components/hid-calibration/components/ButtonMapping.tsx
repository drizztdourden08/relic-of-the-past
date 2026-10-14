/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ButtonMappingActions } from './ButtonMappingActions';
import { ButtonMappingInstruction } from './ButtonMappingInstruction';
import { ButtonMappingList } from './ButtonMappingList';
import './ButtonMapping.css';
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

  if (!prereqsDone) return null;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title">
        {stepTitle}
      </Box>

      {inputPhaseActive && (
        <ButtonMappingInstruction
          items={items}
          activeIndex={activeIndex}
          captureState={captureState}
          axisSubStep={axisSubStep}
          instruction={instruction}
          showAxisSubStep={showAxisSubStep}
        />
      )}

      <ButtonMappingList
        items={items}
        activeIndex={activeIndex}
        inputPhaseActive={inputPhaseActive}
        includeStickTriggerIds={includeStickTriggerIds}
        onClickItem={onClickItem}
        onClearItem={onClearItem}
      />

      <ButtonMappingActions
        activeIndex={activeIndex}
        inputPhaseActive={inputPhaseActive}
        autoAdvance={autoAdvance}
        onStartButtons={onStartButtons}
        onSkip={onSkip}
        onGoBack={onGoBack}
        setAutoAdvanceWrapped={setAutoAdvanceWrapped}
        setInputPhaseActiveWrapped={setInputPhaseActiveWrapped}
      />
    </Box>
  );
};

export { ButtonMapping };
