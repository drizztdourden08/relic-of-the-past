/* @layer renderer-components @kind component */
import { Status, Box, Field, Flex, NumberInput } from '@drizztdourden08/tessera/primitives';
import { MSU1_SAMPLE_RATE } from '@rotp/msu';
import { MAX_LOOP_SECONDS } from './LoopPointField.constants';
import type { LoopPointFieldProps } from './LoopPointField.type';

const toSeconds = (samples: number | undefined): number => {
  if (samples === undefined || !Number.isFinite(samples)) return 0;
  return Math.round((samples / MSU1_SAMPLE_RATE) * 1000) / 1000;
};

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
          <Status tone="neutral">{stateOf(effective, fromFile)}</Status>
        </Flex>
      </Field>
    </Box>
  );
};

export { LoopPointField };
