/* @layer renderer-components @kind component */
import { Select } from '@drizztdourden08/tessera/primitives';
import type { RomLanguage } from '@rotp/asset-extraction';
import { RELEASE_ITEMS } from '../../../../LanguageCreateWizard.constants';
import { RELEASE_COLUMNS } from './ReleaseSelect.constants';
import type { ReleaseSelectProps } from './ReleaseSelect.type';

const ReleaseSelect = ({ value, onChange }: ReleaseSelectProps) => (
  <Select
    items={RELEASE_ITEMS}
    valueField="value"
    value={value}
    columns={RELEASE_COLUMNS}
    getLabel="release"
    onChange={(release: RomLanguage | null) => { if (release) onChange(release); }}
  />
);

export { ReleaseSelect };
