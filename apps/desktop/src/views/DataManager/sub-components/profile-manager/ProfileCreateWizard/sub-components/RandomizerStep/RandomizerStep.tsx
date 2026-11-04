/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Field, Grid, Select, Stack, Text, TextInput, Toggle } from '@drizztdourden08/tessera/primitives';
import type { RandomizerFormState } from '../../../build-randomizer-config';
import { LOCKED_CAPTION, MODE_OPTIONS, ONLINE_CAPTION } from './RandomizerStep.constants';
import type { RandomizerStepProps } from './RandomizerStep.type';

const RandomizerStep = ({ values, update, experimental }: RandomizerStepProps) => {
  const { randomizer } = values;
  const patch = (part: Partial<RandomizerFormState>) => update({ randomizer: { ...randomizer, ...part } });

  useEffect(() => {
    if (!experimental && randomizer.mode === 'online') update({ randomizer: { ...randomizer, mode: 'local' } });
  }, [experimental, randomizer, update]);

  return (
    <Stack gap="md">
      <Toggle label="Randomizer" checked={randomizer.enabled} onChange={(enabled) => patch({ enabled })} />
      {randomizer.enabled && (
        <>
          <Grid columns={2} gap="md">
            <Field label="Seed">
              <TextInput
                type="text"
                placeholder="a seed is required"
                value={randomizer.seed}
                onChange={(e) => patch({ seed: e.target.value })}
              />
            </Field>
            <Field label="Mode">
              <Select
                value={randomizer.mode}
                onChange={(mode) => patch({ mode: mode as RandomizerFormState['mode'], ...(mode === 'local' ? { deathLink: false } : {}) })}
                options={experimental ? MODE_OPTIONS : MODE_OPTIONS.filter((option) => option.value !== 'online')}
              />
            </Field>
          </Grid>
          <Text variant="caption">{experimental && randomizer.mode === 'online' ? ONLINE_CAPTION : LOCKED_CAPTION}</Text>
        </>
      )}
    </Stack>
  );
};

export { RandomizerStep };
