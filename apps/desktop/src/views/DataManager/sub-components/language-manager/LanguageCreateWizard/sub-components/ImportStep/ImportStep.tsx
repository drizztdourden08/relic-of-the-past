/* @layer renderer-components @kind component */
import { Box, Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { PatchedImportReport } from '@app/compounds/PatchedImportReport';
import { ImportProgress } from '../../../../ImportProgress';
import { IMPORTED_MESSAGE } from '../../LanguageCreateWizard.constants';
import { reviewSections } from '../../behavior/review-sections';
import type { ImportStepProps } from './ImportStep.type';

const ImportStep = ({ wizard, sets, progress, patched }: ImportStepProps) => {
  const { busy, error, parts, imported, run } = patched;
  const done = imported !== null;

  return (
    <Stack gap="md">
      <WizardReview
        sections={reviewSections(wizard.values, sets)}
        disabled={busy || done}
        onEdit={(stepId) => wizard.goTo(stepId)}
      />
      {!done && (
        <Box>
          <Button variant="primary" loading={busy} disabled={busy} onClick={run}>Run import</Button>
        </Box>
      )}
      {busy && <ImportProgress state={progress} />}
      {error !== null && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
      {done && <Text variant="caption" tone="success">{IMPORTED_MESSAGE}</Text>}
      <PatchedImportReport parts={parts} />
    </Stack>
  );
};

export { ImportStep };
