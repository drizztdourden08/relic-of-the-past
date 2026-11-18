/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Status, Box, Field, Flex, NumberInput, Slider } from '@drizztdourden08/tessera/primitives';
import { MAX_CROSSFADE_SECONDS } from '@rotp/hub-contracts';
import type { CrossfadeFieldProps } from './CrossfadeField.type';

const clamp = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.max(0, Math.min(MAX_CROSSFADE_SECONDS, value)) * 100) / 100;
};

const CrossfadeField = (props: CrossfadeFieldProps) => {
  const { seconds, layerId, disabled = false, onChange } = props;
  const t = useT();
  const inputId = `crossfade-${layerId}`;
  const stateText = seconds === 0
    ? t('msu-studio:layers.crossfade.off')
    : t('msu-studio:layers.crossfade.on', { seconds: seconds.toFixed(2) });

  return (
    <Box className="msu-accent-panel layer-card__crossfade">
      <Field label={t('msu-studio:layers.crossfade.label')} hint={t('msu-studio:layers.crossfade.hint')} htmlFor={inputId}>
        <Flex gap="md" align="center" wrap>
          <Slider
            className="layer-card__crossfade-slider"
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
            aria-label={t('msu-studio:layers.crossfade.aria')}
            onChange={(value) => onChange(clamp(value))}
          />
          <Status tone={seconds > 0 ? 'success' : 'neutral'}>{stateText}</Status>
        </Flex>
      </Field>
    </Box>
  );
};

export { CrossfadeField };
