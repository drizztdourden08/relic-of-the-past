/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { UploadField } from '@app/compounds/UploadField';
import { LANGUAGE_ROM_ACCEPT } from '../../../../language-manager.constants';
import { chosenStatus } from '../../../behavior/chosen-status';
import type { SourceFieldsProps } from '../DetailsStep.type';

const RomFields = ({ values, update }: SourceFieldsProps) => (
  <Field label="ROM file" hint="The language is read from the ROM. The ROM is not saved.">
    <UploadField
      accept={[...LANGUAGE_ROM_ACCEPT]}
      label="Drop a ROM file to extract its language"
      status={chosenStatus(values.romFile)}
      url={values.romUrl}
      urlPlaceholder="Paste ROM download URL..."
      roms={officialRomStatuses()}
      onFiles={(files) => update({ romFile: files[0] ?? null, romUrl: '' })}
      onUrlChange={(romUrl) => update({ romUrl, romFile: null })}
      onModeChange={() => update({ romFile: null, romUrl: '' })}
    />
  </Field>
);

export { RomFields };
