/* @layer renderer-components @kind constants */
import { createElement } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import type { ListboxColumn } from '@drizztdourden08/tessera/primitives';
import type { ReleaseItem } from '../../../../LanguageCreateWizard.type';

const RELEASE_COLUMNS: readonly ListboxColumn<ReleaseItem>[] = [
  { field: 'release', header: 'Language' },
  { field: 'sha1', header: 'SHA-1', inTrigger: false, render: (hash) => createElement(Text, { mono: true }, String(hash)) },
];

export { RELEASE_COLUMNS };
