/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const PROPERTIES_PANEL = { storageKey: 'language-studio.properties', width: 304, minWidth: 240, maxWidth: 480 };

const SOURCE_LABELS: Record<'rom' | 'patch' | 'custom', (base: string) => Message> = {
  rom: (base) => msg('language-editor:set.source.rom', { base }),
  patch: (base) => msg('language-editor:set.source.patch', { base }),
  custom: (base) => msg('language-editor:set.source.custom', { base }),
};

export { SOURCE_LABELS, PROPERTIES_PANEL };
