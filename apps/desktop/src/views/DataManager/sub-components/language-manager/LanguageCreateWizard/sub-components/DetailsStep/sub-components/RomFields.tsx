/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { UploadField } from '@app/compounds/UploadField';
import { LANGUAGE_ROM_ACCEPT } from '../../../../language-manager.constants';
import { checkPickedRom, romCheckStatus } from '../../../../../rom-check';
import type { SourceFieldsProps } from '../DetailsStep.type';

const RomFields = ({ values, update }: SourceFieldsProps) => (
  <Field label="ROM file" hint="The language is read from the ROM. The ROM is not saved.">
    <UploadField
      accept={[...LANGUAGE_ROM_ACCEPT]}
      label="Drop a ROM file to extract its language"
      status={romCheckStatus(values.romFile, values.romCheck)}
      url={values.romUrl}
      urlPlaceholder="Paste ROM download URL..."
      roms={officialRomStatuses()}
      onFiles={(files) => checkPickedRom(files, 'official', 'snes-alttp',
        (romFile) => update({ romFile, romUrl: '', romCheck: null }), (romCheck) => update({ romCheck }))}
      onUrlChange={(romUrl) => update({ romUrl, romFile: null, romCheck: null })}
      onModeChange={() => update({ romFile: null, romUrl: '', romCheck: null })}
    />
  </Field>
);

export { RomFields };
