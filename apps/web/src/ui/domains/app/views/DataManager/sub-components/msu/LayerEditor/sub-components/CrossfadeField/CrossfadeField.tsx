/* @layer renderer-components @kind component */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Slider } from '@ds/primitives/Slider';
import { MAX_CROSSFADE_SECONDS } from '@shared/types/msu-manifest';
import { CROSSFADE_HINT, CROSSFADE_LABEL } from '../PlayModeFields/PlayModeFields.constants';
import type { CrossfadeFieldProps } from './CrossfadeField.type';

const clamp = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.max(0, Math.min(MAX_CROSSFADE_SECONDS, value)) * 100) / 100;
};

const stateOf = (seconds: number): string =>
  (seconds === 0 ? 'Off, so one pass cuts straight into the next' : `${seconds.toFixed(2)}s of overlap`);

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
            step={0.25}
            disabled={disabled}
            showValue={false}
            onChange={(value) => onChange(clamp(value))}
          />
          <NumberInput
            id={inputId}
            min={0}
            max={MAX_CROSSFADE_SECONDS}
            step={0.25}
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
