/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Status, Box, Field, Flex, NumberInput, Toggle } from '@drizztdourden08/tessera/primitives';
import type { RandomFieldsProps } from './RandomFields.type';

const RandomFields = (props: RandomFieldsProps) => {
  const { mode, layerId, disabled, onChange } = props;
  const t = useT();
  return (
    <>
      <Flex gap="md" align="end" wrap>
        <Field label={t('msu-studio:layers.random.shortest')}>
          <NumberInput
            min={0} step={0.25} max={3600} sizeToContent value={mode.minDelaySeconds} disabled={disabled}
            onChange={(value) => onChange({ ...mode, minDelaySeconds: Number.isFinite(value) ? value : 0 })}
          />
        </Field>
        <Field label={t('msu-studio:layers.random.longest')}>
          <NumberInput
            min={0} step={0.25} max={3600} sizeToContent value={mode.maxDelaySeconds} disabled={disabled}
            onChange={(value) => onChange({ ...mode, maxDelaySeconds: Number.isFinite(value) ? value : 0 })}
          />
        </Field>
        {mode.minDelaySeconds > mode.maxDelaySeconds && (
          <Status tone="danger">{t('msu-studio:layers.random.conflict')}</Status>
        )}
      </Flex>
      <Box className="msu-accent-panel layer-card__switch">
        <Toggle
          id={`wait-for-completion-${layerId}`}
          label={t('msu-studio:layers.wait.label')}
          description={mode.waitForCompletion === true ? t('msu-studio:layers.wait.on') : t('msu-studio:layers.wait.off')}
          checked={mode.waitForCompletion === true}
          disabled={disabled}
          onChange={(waitForCompletion) => onChange({ ...mode, waitForCompletion })}
        />
      </Box>
    </>
  );
};

export { RandomFields };
