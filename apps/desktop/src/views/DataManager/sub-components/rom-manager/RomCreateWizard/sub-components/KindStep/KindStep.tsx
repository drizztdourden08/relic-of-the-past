/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field } from '@drizztdourden08/tessera/primitives';
import { RomKindTabs } from '../../../../RomKindTabs';
import { importLaneConfig } from '../../../import-lane-config.constants';
import type { KindStepProps } from './KindStep.type';

const KindStep = ({ values, update, onKindChange }: KindStepProps) => {
  const t = useT();
  return (
  <Field label={t('wizards:rom.kind.kind-of-rom')} hint={importLaneConfig(t)[values.kind].description} width="full">
    <RomKindTabs
      value={values.kind}
      onChange={(kind) => { update({ kind, file: null, url: '' }); onKindChange(kind); }}
    />
  </Field>
  );
};

export { KindStep };
