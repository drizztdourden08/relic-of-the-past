/* @layer renderer-components @kind component */
/**
 * How long one pass of a looping layer overlaps the next: the outgoing file fades out while the
 * incoming one fades in over this window.
 *
 * It is a framed block with its own heading, an exact seconds box beside the slider, and the state
 * spelled out in words — not a bare slider. A lone slider at its default of zero draws no fill at
 * all, which put an empty grey line directly under the identical-looking Volume slider: the
 * setting was on screen and still could not be found. The number box also lets a value be typed,
 * since half-second steps are coarse for a musical overlap.
 *
 * Zero is a different behaviour rather than a short crossfade, so it is named ("no overlap")
 * instead of reading as an unset control.
 */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Slider } from '@ds/primitives/Slider';
import { MAX_CROSSFADE_SECONDS } from '@shared/types/msu-manifest';
import { CROSSFADE_HINT, CROSSFADE_LABEL } from '../PlayModeFields/PlayModeFields.constants';
import type { CrossfadeFieldProps } from './CrossfadeField.type';

/** Snapped to tenths: a crossfade typed as 2.55s would otherwise read back as itself forever. */
const clamp = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.max(0, Math.min(MAX_CROSSFADE_SECONDS, value)) * 10) / 10;
};

const stateOf = (seconds: number): string =>
  (seconds === 0 ? 'Off — no overlap, hard cut' : `${seconds.toFixed(1)}s of overlap`);

const CrossfadeField = (props: CrossfadeFieldProps) => {
  const { seconds, layerId, disabled = false, onChange } = props;
  const inputId = `crossfade-${layerId}`;

  return (
    <Box className="layer-card__crossfade">
      <Field label={CROSSFADE_LABEL} hint={CROSSFADE_HINT} htmlFor={inputId}>
        <Flex gap="md" align="center" wrap>
          <Slider
            value={seconds}
            min={0}
            max={MAX_CROSSFADE_SECONDS}
            step={0.5}
            disabled={disabled}
            showValue={false}
            onChange={(value) => onChange(clamp(value))}
          />
          <NumberInput
            id={inputId}
            min={0}
            max={MAX_CROSSFADE_SECONDS}
            step={0.5}
            sizeToContent
            value={seconds}
            disabled={disabled}
            aria-label={`${CROSSFADE_LABEL}, in seconds`}
            onChange={(value) => onChange(clamp(value))}
          />
          <Badge variant={seconds > 0 ? 'success' : 'neutral'}>{stateOf(seconds)}</Badge>
        </Flex>
      </Field>
    </Box>
  );
};

export { CrossfadeField };
