/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { EmptyState, Field, Select } from '@drizztdourden08/tessera/primitives';
import type { RomStepProps } from './RomStep.type';

const RomStep = ({ values, update, roms, extractedMap }: RomStepProps) => {
  const t = useT();
  return (
  <Field label={t('wizards:sprite.rom.extract-sprites-from')}>
    {roms.length > 0 ? (
      <Select
        value={values.romFile}
        onChange={(romFile) => update({ romFile })}
        options={[{ value: '', label: t('wizards:sprite.rom.select-a-rom') }, ...roms.map((r) => ({ value: r.romFile, label: extractedMap[r.romFile]?.extracted ? t('wizards:sprite.rom.has-sprites', { name: r.romFile }) : r.romFile }))]}
        placeholder={t('wizards:sprite.rom.select-a-rom')}
      />
    ) : (
      <EmptyState message={t('wizards:sprite.rom.no-roms')} />
    )}
  </Field>
  );
};

export { RomStep };
