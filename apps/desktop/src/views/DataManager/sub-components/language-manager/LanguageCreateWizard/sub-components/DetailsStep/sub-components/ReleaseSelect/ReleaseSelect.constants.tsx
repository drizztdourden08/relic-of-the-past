/* @layer renderer-components @kind constants */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { ListboxColumn } from '@drizztdourden08/tessera/primitives';
import type { ReleaseItem } from '../../../../LanguageCreateWizard.type';

const RELEASE_COLUMNS: readonly ListboxColumn<ReleaseItem>[] = [
  { field: 'release', header: 'Release' },
  { field: 'rom', header: 'ROM', inTrigger: false },
  { field: 'sha1', header: 'SHA-1', inTrigger: false, render: (hash) => <Text mono>{String(hash)}</Text> },
];

export { RELEASE_COLUMNS };
