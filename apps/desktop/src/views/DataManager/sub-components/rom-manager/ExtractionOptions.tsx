/* @layer renderer-components @kind component */
import { Box, Callout, Checkbox, Field } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../ImportProgress';
import { EXTRACTION_HINT, EXTRACTION_LABEL, SPRITES_TOO_LABEL } from './rom-extraction.constants';
import type { ExtractionOptionsProps } from './rom-extraction.type';

const ExtractionOptions = (props: ExtractionOptionsProps) => {
  const { withSprites, onWithSpritesChange, spriteProgress, spriteError } = props;

  return (
    <Box className="import-form">
      <Field label={EXTRACTION_LABEL} hint={EXTRACTION_HINT} width="full">
        <Checkbox checked={withSprites} onChange={onWithSpritesChange} label={SPRITES_TOO_LABEL} />
      </Field>
      {spriteProgress.active && <ImportProgress state={spriteProgress} fallbackLabel="Extracting sprites..." />}
      {spriteError && <Callout tone="danger">{spriteError}</Callout>}
    </Box>
  );
};

export { ExtractionOptions };
