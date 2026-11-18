/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { PatchedImportReport } from '@app/compounds/PatchedImportReport';
import { ImportProgress } from '../../../../ImportProgress';
import { reviewSections } from '../../behavior/review-sections';
import type { ImportStepProps } from './ImportStep.type';

const ImportStep = ({ wizard, sets, progress, patched }: ImportStepProps) => {
  const t = useT();
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
          <Button variant="primary" loading={busy} disabled={busy} onClick={run}>{t('wizards:language.import.run-import')}</Button>
        </Box>
      )}
      {busy && <ImportProgress state={progress} />}
      {error !== null && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
      {done && <Text variant="caption" tone="success">{t('wizards:language.import.saved')}</Text>}
      <PatchedImportReport parts={parts} />
    </Stack>
  );
};

export { ImportStep };
