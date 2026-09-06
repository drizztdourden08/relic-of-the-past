/* @layer renderer-components @kind component */
/**
 * Loop point of a looping layer. MSU-1 stores it in the `.pcm` header as a sample count; other
 * formats have nowhere to put it, so it lives in the manifest and overrides what a `.pcm` declares.
 * Edited in seconds, stored in samples. Millisecond resolution: a loop a few samples off clicks.
 */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { NumberInput } from '@ds/primitives/NumberInput';
import { MSU1_SAMPLE_RATE } from '@app/lib/msu/decode/parse-msu1';
import type { LoopPointFieldProps } from './LoopPointField.type';

/** Longest loop point worth offering: past an hour it is not an intro any more. */
const MAX_LOOP_SECONDS = 3600;

// Rounded to the millisecond for DISPLAY only (a real track gave 13.181768707482993); whole samples are stored.
const toSeconds = (samples: number | undefined): number => {
  if (samples === undefined || !Number.isFinite(samples)) return 0;
  return Math.round((samples / MSU1_SAMPLE_RATE) * 1000) / 1000;
};

/** Back to whole samples, which is the only resolution the format actually stores. */
const toSamples = (seconds: number): number | undefined => {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  const clamped = Math.min(seconds, MAX_LOOP_SECONDS);
  return Math.round(clamped * MSU1_SAMPLE_RATE);
};

const stateOf = (samples: number | undefined, fromFile: boolean): string => {
  if (samples === undefined || samples <= 0) return 'From the start, so the whole file repeats';
  const where = `${toSeconds(samples).toFixed(3)}s`;
  return fromFile
    ? `The file declares ${where}, so the intro plays once and then repeats from there`
    : `Intro plays once, then repeats from ${where}`;
};

const LoopPointField = (props: LoopPointFieldProps) => {
  const { loopSample, fileLoopSample, layerId, disabled = false, onChange } = props;
  const inputId = `loop-point-${layerId}`;
  // The manifest wins; the file's own point is what the slot does until someone overrides it.
  const effective = loopSample ?? (fileLoopSample ?? undefined);
  const fromFile = loopSample === undefined && fileLoopSample !== null && fileLoopSample > 0;

  return (
    <Box className="layer-card__loop-point">
      <Field
        label="Repeat from"
        hint="Seconds into the file that each repeat starts at. 0 repeats the whole file."
        htmlFor={inputId}
      >
        <Flex gap="sm" align="center" wrap>
          <NumberInput
            id={inputId}
            min={0}
            step={0.25}
            max={MAX_LOOP_SECONDS}
            sizeToContent
            value={toSeconds(effective)}
            disabled={disabled}
            onChange={(seconds) => onChange(toSamples(seconds))}
          />
          <Badge variant="neutral">{stateOf(effective, fromFile)}</Badge>
        </Flex>
      </Field>
    </Box>
  );
};

export { LoopPointField, MAX_LOOP_SECONDS };
