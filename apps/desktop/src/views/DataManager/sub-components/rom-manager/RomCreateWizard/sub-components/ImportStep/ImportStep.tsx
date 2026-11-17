/* @layer renderer-components @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { OfficialRomList } from '@app/compounds/OfficialRomList';
import { ImportProgress } from '../../../../ImportProgress';
import { ExtractionOptions } from '../../../ExtractionOptions';
import { STEP_IDS, STEP_LABELS } from '../../RomCreateWizard.constants';
import type { ImportStepProps } from './ImportStep.type';

const ImportStep = ({ wizard, extraction, progress }: ImportStepProps) => {
  const { values } = wizard;
  const sections = [{
    stepId: STEP_IDS.file,
    title: STEP_LABELS.file,
    rows: [{ label: 'ROM', value: values.file?.name ?? values.url.trim() }],
  }];

  return (
    <Stack gap="md">
      <WizardReview sections={sections} disabled={wizard.busy} onEdit={(stepId) => wizard.goTo(stepId)} />
      <OfficialRomList roms={officialRomStatuses()} />
      <ExtractionOptions extraction={extraction} />
      {wizard.busy && progress.active && <ImportProgress state={progress} />}
    </Stack>
  );
};

export { ImportStep };
