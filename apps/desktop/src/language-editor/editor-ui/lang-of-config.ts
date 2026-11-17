/* @layer renderer-components @kind logic */
import type { LanguageConfig } from '@rotp/asset-extraction';

const langOfConfig = (cfg: LanguageConfig): string | undefined => (cfg.id.startsWith('ja') ? 'ja' : undefined);

export { langOfConfig };
