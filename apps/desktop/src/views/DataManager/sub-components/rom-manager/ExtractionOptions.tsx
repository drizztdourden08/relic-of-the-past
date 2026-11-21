/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Callout, Checkbox } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../ImportProgress';
import type { ExtractionOptionsProps } from './rom-extraction.type';

const ExtractionOptions = (props: ExtractionOptionsProps) => {
  const { extraction } = props;
  const t = useT();
  const { withSprites, setWithSprites, spriteProgress, spriteError } = extraction;

  return (
    <>
      <Checkbox checked={withSprites} onChange={setWithSprites} label={t('data-manager:rom-manager.sprites-too')} />
      {spriteProgress.active && <ImportProgress state={spriteProgress} fallbackLabel={t('data-manager:rom-manager.extracting-sprites')} />}
      {spriteError && <Callout tone="danger">{spriteError}</Callout>}
    </>
  );
};

export { ExtractionOptions };
