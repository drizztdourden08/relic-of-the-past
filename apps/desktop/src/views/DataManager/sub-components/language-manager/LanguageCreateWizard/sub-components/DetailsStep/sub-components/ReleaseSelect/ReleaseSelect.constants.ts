/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { createElement } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import type { ListboxColumn } from '@drizztdourden08/tessera/primitives';
import type { ReleaseItem } from '../../../../LanguageCreateWizard.type';

const releaseColumns = (t: I18n['t']): readonly ListboxColumn<ReleaseItem>[] => [
  { field: 'release', header: t('wizards:language.release.language') },
  { field: 'sha1', header: 'SHA-1', inTrigger: false, render: (hash) => createElement(Text, { mono: true }, String(hash)) },
];

export { releaseColumns };
