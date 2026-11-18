/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { UploadField } from '@app/compounds/UploadField';
import { checkPickedRom, romCheckStatus } from '../../../../rom-check';
import { IMPORT_LANE_CONFIG } from '../../../import-lane-config.constants';
import type { FileStepProps } from './FileStep.type';

const FileStep = ({ values, update }: FileStepProps) => {
  const lane = IMPORT_LANE_CONFIG[values.kind];
  const roms = officialRomStatuses().filter((rom) => rom.kind === values.kind);

  return (
    <Field label="ROM file">
      <UploadField
        accept={lane.accept}
        label={lane.dropLabel}
        hint={lane.dropHint}
        status={romCheckStatus(values.file, values.check)}
        url={values.url}
        urlPlaceholder={lane.placeholder}
        roms={roms}
        onFiles={(files) => checkPickedRom(files, 'official', values.kind,
          (file) => update({ file, url: '', check: null }), (check) => update({ check }))}
        onUrlChange={(url) => update({ url, file: null, check: null })}
        onModeChange={() => update({ file: null, url: '', check: null })}
      />
    </Field>
  );
};

export { FileStep };
