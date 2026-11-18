/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { ImportProgress } from '../../../../ImportProgress';
import { ExtractionOptions } from '../../../ExtractionOptions';
import { STEP_IDS, stepLabels } from '../../RomCreateWizard.constants';
import type { ImportStepProps } from './ImportStep.type';

const ImportStep = ({ wizard, extraction, progress }: ImportStepProps) => {
  const t = useT();
  const { values } = wizard;
  const sections = [{
    stepId: STEP_IDS.file,
    title: stepLabels(t).file,
    rows: [{ label: t('wizards:rom.review.rom'), value: values.file?.name ?? values.url.trim() }],
  }];

  return (
    <Stack gap="md">
      <WizardReview sections={sections} disabled={wizard.busy} onEdit={(stepId) => wizard.goTo(stepId)} />
      <ExtractionOptions extraction={extraction} />
      {wizard.busy && progress.active && <ImportProgress state={progress} />}
    </Stack>
  );
};

export { ImportStep };
