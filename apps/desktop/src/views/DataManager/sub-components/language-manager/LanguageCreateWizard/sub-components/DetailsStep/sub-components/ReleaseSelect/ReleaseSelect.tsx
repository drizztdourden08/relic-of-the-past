/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Select } from '@drizztdourden08/tessera/primitives';
import type { RomLanguage } from '@rotp/asset-extraction';
import { releaseItems } from '../../../../LanguageCreateWizard.constants';
import { releaseColumns } from './ReleaseSelect.constants';
import type { ReleaseSelectProps } from './ReleaseSelect.type';

const ReleaseSelect = ({ value, onChange }: ReleaseSelectProps) => {
  const t = useT();
  return (
  <Select
    items={releaseItems(t)}
    valueField="value"
    value={value}
    columns={releaseColumns(t)}
    getLabel="release"
    onChange={(release: RomLanguage | null) => { if (release) onChange(release); }}
  />
  );
};

export { ReleaseSelect };
