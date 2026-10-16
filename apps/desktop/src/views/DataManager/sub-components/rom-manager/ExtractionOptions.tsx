/* @layer renderer-components @kind component */
import { Callout, Checkbox } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../ImportProgress';
import { EXTRACTION_HINT, SPRITES_TOO_LABEL } from './rom-extraction.constants';
import type { ExtractionOptionsProps } from './rom-extraction.type';

const ExtractionOptions = (props: ExtractionOptionsProps) => {
  const { extraction } = props;
  const { withSprites, setWithSprites, spriteProgress, spriteError } = extraction;

  return (
    <>
      <Checkbox checked={withSprites} onChange={setWithSprites} label={SPRITES_TOO_LABEL} help={EXTRACTION_HINT} />
      {spriteProgress.active && <ImportProgress state={spriteProgress} fallbackLabel="Extracting sprites..." />}
      {spriteError && <Callout tone="danger">{spriteError}</Callout>}
    </>
  );
};

export { ExtractionOptions };
