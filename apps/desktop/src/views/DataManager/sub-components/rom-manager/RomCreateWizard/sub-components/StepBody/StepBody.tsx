/* @layer renderer-components @kind component */
import { STEP_IDS } from '../../RomCreateWizard.constants';
import type { StepBodyProps } from '../../RomCreateWizard.type';
import { FileStep } from '../FileStep';
import { ImportStep } from '../ImportStep';
import { KindStep } from '../KindStep';

const StepBody = (props: StepBodyProps) => {
  const { wizard, extraction, progress, onKindChange } = props;
  const { values, update } = wizard;

  switch (wizard.current.id) {
    case STEP_IDS.kind:
      return <KindStep values={values} update={update} onKindChange={onKindChange} />;
    case STEP_IDS.file:
      return <FileStep values={values} update={update} />;
    default:
      return <ImportStep wizard={wizard} extraction={extraction} progress={progress} />;
  }
};

export { StepBody };
