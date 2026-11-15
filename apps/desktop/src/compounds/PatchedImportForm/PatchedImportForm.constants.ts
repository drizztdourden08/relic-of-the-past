/* @layer renderer-components @kind constants */
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import type { RomLanguage } from '@rotp/asset-extraction';

const DEFAULT_BASE: RomLanguage = 'us';

const RELEASE_OPTIONS: readonly SelectOption[] = [
  { value: 'us', label: 'US English' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'fr-c', label: 'French Canadian' },
  { value: 'en', label: 'European English' },
  { value: 'es', label: 'Spanish' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'sv', label: 'Swedish' },
  { value: 'redux', label: 'Redux' },
];

const ROM_ACCEPT = ['.sfc', '.smc', '.zip'];

export { DEFAULT_BASE, RELEASE_OPTIONS, ROM_ACCEPT };
