/* @layer renderer-views @kind view */
import { Wizard } from '@drizztdourden08/tessera/composites';
import { STEP_IDS, WIZARD_TITLE } from './MsuCreateWizard.constants';
import type { MsuCreateWizardProps } from './MsuCreateWizard.type';
import { useMsuWizard } from './behavior/useMsuWizard';
import { DetailsStep } from './sub-components/DetailsStep';
import { ReviewStep } from './sub-components/ReviewStep';
import { SourceStep } from './sub-components/SourceStep';

const MsuCreateWizard = (props: MsuCreateWizardProps) => {
  const { refresh, isTaken, onCancel, onCreated } = props;
  const { wizard, progress } = useMsuWizard({ refresh, isTaken, onCreated });
  const { values, update } = wizard;

  const body = (() => {
    switch (wizard.current.id) {
      case STEP_IDS.source:
        return <SourceStep values={values} update={update} />;
      case STEP_IDS.details:
        return <DetailsStep values={values} update={update} />;
      default:
        return <ReviewStep wizard={wizard} progress={progress} />;
    }
  })();

  return (
    <Wizard wizard={wizard} busy={wizard.busy} title={WIZARD_TITLE} orientation="vertical" stepperSize="sm" onExit={onCancel}>
      {body}
    </Wizard>
  );
};

export { MsuCreateWizard };
