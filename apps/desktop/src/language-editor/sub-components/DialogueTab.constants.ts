/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { EntryFilter } from './DialogueTab.type';

const filterOptionsOf = (t: I18n['t']): SegmentOption<EntryFilter>[] => [
  { value: 'all', label: t('language-editor:filter.all') },
  { value: 'warnings', label: t('language-editor:filter.warnings') },
  { value: 'choices', label: t('language-editor:filter.choices') },
];

export { filterOptionsOf };
