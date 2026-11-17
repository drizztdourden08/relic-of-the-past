/* @layer renderer-components @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../../../../ImportProgress';
import type { ExtractStepProps } from './ExtractStep.type';

const ExtractStep = ({ romFile, busy, progress }: ExtractStepProps) => (
  <Stack gap="md">
    <Text variant="body">{`Sprites will be extracted from ${romFile}.`}</Text>
    {busy && <ImportProgress state={progress} fallbackLabel="Extracting sprites..." />}
  </Stack>
);

export { ExtractStep };
