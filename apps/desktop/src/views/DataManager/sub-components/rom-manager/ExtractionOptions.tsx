/* @layer renderer-components @kind component */
import { Box, Callout, Checkbox } from '@drizztdourden08/tessera/primitives';
import { HelpTip } from '@app/compounds/HelpTip';
import { ImportProgress } from '../ImportProgress';
import { EXTRACTION_HELP_LABEL, EXTRACTION_HINT, SPRITES_TOO_LABEL } from './rom-extraction.constants';
import type { ExtractionOptionsProps } from './rom-extraction.type';

const ExtractionOptions = (props: ExtractionOptionsProps) => {
  const { extraction } = props;
  const { withSprites, setWithSprites, spriteProgress, spriteError } = extraction;

  return (
    <>
      <Box className="import-form__option">
        <Checkbox checked={withSprites} onChange={setWithSprites} label={SPRITES_TOO_LABEL} />
        <HelpTip label={EXTRACTION_HELP_LABEL}>{EXTRACTION_HINT}</HelpTip>
      </Box>
      {spriteProgress.active && <ImportProgress state={spriteProgress} fallbackLabel="Extracting sprites..." />}
      {spriteError && <Callout tone="danger">{spriteError}</Callout>}
    </>
  );
};

export { ExtractionOptions };
