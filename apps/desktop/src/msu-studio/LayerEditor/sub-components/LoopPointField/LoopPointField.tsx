/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { Status, Box, Field, Flex, NumberInput } from '@drizztdourden08/tessera/primitives';
import { MSU1_SAMPLE_RATE } from '@drizztdourden08/brock-msu/format';
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

const stateOf = (t: I18n['t'], samples: number | undefined, fromFile: boolean): string => {
  if (samples === undefined || samples <= 0) return t('msu-studio:layers.loop.start');
  const where = `${toSeconds(samples).toFixed(3)}s`;
  return fromFile
    ? t('msu-studio:layers.loop.from-file', { where })
    : t('msu-studio:layers.loop.intro', { where });
};

const LoopPointField = (props: LoopPointFieldProps) => {
  const { loopSample, fileLoopSample, layerId, disabled = false, onChange } = props;
  const t = useT();
  const inputId = `loop-point-${layerId}`;
  const effective = loopSample ?? (fileLoopSample ?? undefined);
  const fromFile = loopSample === undefined && fileLoopSample !== null && fileLoopSample > 0;

  return (
    <Box className="layer-card__loop-point">
      <Field
        label={t('msu-studio:layers.loop.label')}
        hint={t('msu-studio:layers.loop.hint')}
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
          <Status tone="neutral">{stateOf(t, effective, fromFile)}</Status>
        </Flex>
      </Field>
    </Box>
  );
};

export { LoopPointField };
