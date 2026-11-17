/* @layer renderer-components @kind component */
import { EmptyState, Field, Select } from '@drizztdourden08/tessera/primitives';
import { NO_ROMS_MESSAGE, romLabel } from '../../SpriteCreateWizard.constants';
import type { RomStepProps } from './RomStep.type';

const RomStep = ({ values, update, roms, extractedMap }: RomStepProps) => (
  <Field label="Extract sprites from">
    {roms.length > 0 ? (
      <Select
        value={values.romFile}
        onChange={(romFile) => update({ romFile })}
        options={[{ value: '', label: 'Select a ROM...' }, ...roms.map((r) => ({ value: r.romFile, label: romLabel(r.romFile, extractedMap) }))]}
        placeholder="Select a ROM..."
      />
    ) : (
      <EmptyState message={NO_ROMS_MESSAGE} />
    )}
  </Field>
);

export { RomStep };
