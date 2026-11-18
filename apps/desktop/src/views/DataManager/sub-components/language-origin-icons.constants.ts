/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { LanguageSetSummary } from '@rotp/languages';

const LANGUAGE_ORIGIN_ICONS: Record<LanguageSetSummary['origin'], IconName> = {
  rom: 'cartridge',
  patch: 'patch',
  custom: 'pencil',
};

const LANGUAGE_ORIGIN_TAGS: Record<LanguageSetSummary['origin'], string> = {
  rom: '',
  patch: ' · patched ROM',
  custom: ' · custom',
};

export { LANGUAGE_ORIGIN_ICONS, LANGUAGE_ORIGIN_TAGS };
