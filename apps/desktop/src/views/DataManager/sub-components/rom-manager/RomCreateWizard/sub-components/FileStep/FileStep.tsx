/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { officialRomStatuses } from '@rotp/roms';
import { UploadField } from '@app/compounds/UploadField';
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
        status={values.file === null ? undefined : { tone: 'success', message: values.file.name }}
        url={values.url}
        urlPlaceholder={lane.placeholder}
        roms={roms}
        onFiles={(files) => update({ file: files[0] ?? null, url: '' })}
        onUrlChange={(url) => update({ url, file: null })}
        onModeChange={() => update({ file: null, url: '' })}
      />
    </Field>
  );
};

export { FileStep };
