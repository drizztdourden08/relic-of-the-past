/* @layer shared-types @kind logic */
/**
 * Invoke channels for translation data, split out of the main invoke contract
 * the same way the controller and updater namespaces are.
 *
 * Two generations coexist on purpose. The legacy channels read the extracted
 * payload a ROM import writes and back the read-only inspector; the set
 * channels read and write the editable model in shared/storage/languages,
 * which is what the editor and the asset bake both go through.
 */
import type { LanguagePack, LanguageSummary } from '@shared/types/language';
import type { LanguageSet } from '@shared/game/language';
import type { LanguageSetSummary, NewSetParams } from '@shared/storage/languages';

type Result = { success: boolean; error?: string };

interface LanguageInvokeContract {
  // Legacy — extraction + the read-only inspector
  'languages:list': () => Promise<LanguageSummary[]>;
  'languages:extract': (romFile: string, langCode: string) => Promise<Result>;
  'languages:extractFromFile': (filePath: string, langCode: string) => Promise<Result>;
  'languages:extractFromUrl': (url: string, langCode: string) => Promise<Result>;
  'languages:delete': (langCode: string) => Promise<void>;
  'languages:getLanguage': (langCode: string) => Promise<LanguagePack | null>;

  // Editable sets — every write triggers an asset recompile so the change
  // reaches the blob the core reads at boot
  'languages:listSets': () => Promise<LanguageSetSummary[]>;
  'languages:getSet': (id: string) => Promise<LanguageSet | null>;
  'languages:saveSet': (set: LanguageSet) => Promise<void>;
  'languages:createSet': (params: NewSetParams) => Promise<LanguageSet>;
  'languages:duplicateSet': (sourceId: string, id: string, name: string) => Promise<LanguageSet>;
}

export type { LanguageInvokeContract };
