/* @layer renderer-components @kind component */
/**
 * Where a looping layer restarts from, giving any file the intro-then-loop structure that MSU-1
 * otherwise only grants a `.pcm`.
 *
 * MSU-1 keeps this in the `.pcm` header as a sample count, and it is normally NOT zero: a track
 * opens with an intro played once and then repeats only the body after it. No other format has
 * anywhere to say that, so for a `.wav`, `.mp3` or `.ogg` layer the point lives in the manifest
 * instead, and set here it also overrides whatever a `.pcm` declared.
 *
 * Edited in seconds because that is what an author hears, stored in samples because that is the
 * unit MSU-1 writes and reads. Resolution is a millisecond, finer than the other time fields: a
 * loop that lands a few samples off clicks audibly every time it comes round.
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

/**
 * Rounded to the millisecond for DISPLAY only. A sample count rarely divides into a round number of
 * seconds — the loop point read out of a real track came to 13.181768707482993 — and a field full of
 * float noise reads as a bug. What gets stored is still whole samples, converted back on edit.
 */
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
  if (samples === undefined || samples <= 0) return 'From the start — the whole file repeats';
  const where = `${toSeconds(samples).toFixed(3)}s`;
  return fromFile
    ? `The file declares ${where} — intro plays once, then repeats from there`
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
