/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { IconName } from '@drizztdourden08/tessera/primitives';

const extractionMeta = (t: I18n['t']): Record<RomExtractionStatus, { icon: IconName | null; label: string }> => ({
  ready: { icon: 'check', label: t('data-manager:rom-manager.extraction.ready') },
  extracting: { icon: 'refresh-cw', label: t('data-manager:rom-manager.extraction.extracting') },
  failed: { icon: 'x', label: t('data-manager:rom-manager.extraction.failed') },
  idle: { icon: null, label: t('data-manager:rom-manager.extraction.idle') },
});

export { extractionMeta };
