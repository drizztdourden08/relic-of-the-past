/* @layer renderer-views @kind view */
import { Wizard } from '@drizztdourden08/tessera/composites';
import { WIZARD_TITLE } from './RomCreateWizard.constants';
import type { RomCreateWizardProps } from './RomCreateWizard.type';
import { useRomWizard } from './behavior/useRomWizard';
import { StepBody } from './sub-components/StepBody';

const RomCreateWizard = (props: RomCreateWizardProps) => {
  const { extraction, onKindChange, onCancel } = props;
  const { wizard, progress } = useRomWizard(props);

  return (
    <Wizard wizard={wizard} busy={wizard.busy} title={WIZARD_TITLE} orientation="vertical" stepperSize="sm" onExit={onCancel}>
      <StepBody wizard={wizard} extraction={extraction} progress={progress} onKindChange={onKindChange} />
    </Wizard>
  );
};

export { RomCreateWizard };
