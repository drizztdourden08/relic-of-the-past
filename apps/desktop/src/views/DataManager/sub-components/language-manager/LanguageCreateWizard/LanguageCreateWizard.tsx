/* @layer renderer-views @kind view */
import { Wizard } from '@drizztdourden08/tessera/composites';
import { WIZARD_TITLE } from './LanguageCreateWizard.constants';
import type { LanguageCreateWizardProps } from './LanguageCreateWizard.type';
import { useLanguageWizard } from './behavior/useLanguageWizard';
import { StepBody } from './sub-components/StepBody';

const LanguageCreateWizard = (props: LanguageCreateWizardProps) => {
  const { sets, baseSets, refresh, onCancel, onCreated } = props;
  const { wizard, progress, patched } = useLanguageWizard({ sets, refresh, onCreated });

  return (
    <Wizard
      wizard={wizard}
      busy={patched.busy}
      title={WIZARD_TITLE}
      orientation="vertical"
      stepperSize="sm"
      onExit={onCancel}
    >
      <StepBody wizard={wizard} sets={sets} baseSets={baseSets} progress={progress} patched={patched} />
    </Wizard>
  );
};

export { LanguageCreateWizard };
