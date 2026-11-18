/* @layer renderer-components @kind component */
import { DropZone, Field, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { OfficialRomList } from '@app/compounds/OfficialRomList';
import { LANGUAGE_ROM_ACCEPT } from '../../../../language-manager.constants';
import { chosenStatus } from '../../../behavior/chosen-status';
import type { SourceFieldsProps } from '../DetailsStep.type';

const RomFields = ({ values, update }: SourceFieldsProps) => (
  <Stack gap="md">
    <Field label="ROM file">
      <DropZone
        accept={[...LANGUAGE_ROM_ACCEPT]}
        variant="inline"
        label="Drop a ROM file to extract its language"
        hint="The language is read from the ROM. The ROM is not saved."
        status={chosenStatus(values.romFile)}
        onDrop={(files) => update({ romFile: files[0] ?? null, romUrl: '' })}
      />
    </Field>
    <OfficialRomList roms={officialRomStatuses()} />
    <Field label="Or a download link">
      <TextInput
        type="text"
        placeholder="Paste ROM download URL..."
        value={values.romUrl}
        onChange={(e) => update({ romUrl: e.currentTarget.value, romFile: null })}
      />
    </Field>
  </Stack>
);

export { RomFields };
