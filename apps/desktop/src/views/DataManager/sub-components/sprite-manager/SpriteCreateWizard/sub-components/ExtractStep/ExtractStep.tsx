/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../../../../ImportProgress';
import type { ExtractStepProps } from './ExtractStep.type';

const ExtractStep = ({ romFile, busy, progress }: ExtractStepProps) => {
  const t = useT();
  return (
  <Stack gap="md">
    <Text variant="body">{t('wizards:sprite.extract.will-extract', { name: romFile })}</Text>
    {busy && <ImportProgress state={progress} fallbackLabel={t('wizards:sprite.extract.extracting-sprites')} />}
  </Stack>
  );
};

export { ExtractStep };
