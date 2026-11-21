/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Field } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { UploadField } from '@app/compounds/UploadField';
import { LANGUAGE_ROM_ACCEPT } from '../../../../language-manager.constants';
import { checkPickedRom, romCheckStatus } from '../../../../../rom-check';
import type { SourceFieldsProps } from '../DetailsStep.type';

const RomFields = ({ values, update }: SourceFieldsProps) => {
  const t = useT();
  const text = useText();
  return (
  <Field label={t('wizards:language.details.rom-file')} hint={t('wizards:language.details.the-language-is-read-from')}>
    <UploadField
      accept={[...LANGUAGE_ROM_ACCEPT]}
      label={t('wizards:language.details.drop-a-rom-file-to')}
      status={romCheckStatus(values.romFile, values.romCheck, t)}
      url={values.romUrl}
      urlPlaceholder={t('wizards:language.details.paste-rom-download-url')}
      roms={officialRomStatuses()}
      onFiles={(files) => checkPickedRom({
        files, mode: 'official', expected: 'snes-alttp', text,
        on: { file: (romFile) => update({ romFile, romUrl: '', romCheck: null }), check: (romCheck) => update({ romCheck }) },
      })}
      onUrlChange={(romUrl) => update({ romUrl, romFile: null, romCheck: null })}
      onModeChange={() => update({ romFile: null, romUrl: '', romCheck: null })}
    />
  </Field>
  );
};

export { RomFields };
