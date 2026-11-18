/* @layer shared-storage @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { fanTranslationLanguage } from '@rotp/asset-extraction';

const fanTranslationMessage = (hash: string): Message | null => {
  const language = fanTranslationLanguage(hash);
  return language === null ? null : msg('roms:verdict.fan-translation', { language });
};

export { fanTranslationMessage };
