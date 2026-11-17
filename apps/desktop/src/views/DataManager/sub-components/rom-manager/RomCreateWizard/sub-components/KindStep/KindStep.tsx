/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { RomKindTabs } from '../../../../RomKindTabs';
import { IMPORT_LANE_CONFIG } from '../../../import-lane-config.constants';
import type { KindStepProps } from './KindStep.type';

const KindStep = ({ values, update, onKindChange }: KindStepProps) => (
  <Field label="Kind of ROM" hint={IMPORT_LANE_CONFIG[values.kind].description} width="full">
    <RomKindTabs
      value={values.kind}
      onChange={(kind) => { update({ kind, file: null, url: '' }); onKindChange(kind); }}
    />
  </Field>
);

export { KindStep };
