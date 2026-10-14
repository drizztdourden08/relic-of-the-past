/* @layer renderer-components @kind component */
import { ButtonMapping } from './ButtonMapping';
import type { WizardSectionProps } from './WizardSection.type';

const WizardMappingSection = (props: WizardSectionProps) => {
  const { wiz } = props;

  return (
    <ButtonMapping
      items={wiz.items}
      buttonItems={wiz.buttonItems}
      buttonCapturedCount={wiz.buttonCapturedCount}
      activeIndex={wiz.activeIndex}
      inputPhaseActive={wiz.inputPhaseActive}
      autoAdvance={wiz.autoAdvance}
      captureState={wiz.captureState}
      axisSubStep={wiz.axisSubStep}
      instruction={wiz.getInstruction()}
      prereqsDone={wiz.prereqsDone}
      onStartButtons={wiz.handleStartButtons}
      onSkip={wiz.handleSkip}
      onGoBack={wiz.handleGoBack}
      onClickItem={wiz.handleClickItem}
      onClearItem={wiz.handleClearItem}
      setAutoAdvanceWrapped={wiz.setAutoAdvanceWrapped}
      setInputPhaseActiveWrapped={wiz.setInputPhaseActiveWrapped}
    />
  );
};

export { WizardMappingSection };
