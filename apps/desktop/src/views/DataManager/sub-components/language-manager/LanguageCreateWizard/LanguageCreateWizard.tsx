/* @layer renderer-views @kind view */
import { useT } from '@drizztdourden08/brock-react';
import { Wizard } from '@drizztdourden08/tessera/composites';
import type { LanguageCreateWizardProps } from './LanguageCreateWizard.type';
import { useLanguageWizard } from './behavior/useLanguageWizard';
import { StepBody } from './sub-components/StepBody';

const LanguageCreateWizard = (props: LanguageCreateWizardProps) => {
  const t = useT();
  const t = useT();
  const { sets, baseSets, refresh, onCancel, onCreated } = props;
  const { wizard, progress, patched } = useLanguageWizard({ sets, refresh, onCreated });

  return (
    <Wizard
      wizard={wizard}
      busy={patched.busy}
      title={t('wizards:language.title')}
      orientation="vertical"
      stepperSize="sm"
      onExit={onCancel}
    >
      <StepBody wizard={wizard} sets={sets} baseSets={baseSets} progress={progress} patched={patched} />
    </Wizard>
  );
};

export { LanguageCreateWizard };
