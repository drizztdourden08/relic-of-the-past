/* @layer shared-types @kind types */
import type { LanguagePack, LanguageSummary } from '@shared/types/language';
import type { LanguageSet } from '@shared/game/language';
import type { LanguageSetSummary, CreateSetParams } from '@shared/storage/languages';
import type { InvokeResult } from './invoke/invoke-result.type';

interface LanguageInvokeContract {
  'languages:list': () => Promise<LanguageSummary[]>;
  'languages:extract': (romFile: string, langCode: string) => Promise<InvokeResult>;
  'languages:extractFromFile': (filePath: string, langCode: string) => Promise<InvokeResult>;
  'languages:extractFromUrl': (url: string, langCode: string) => Promise<InvokeResult>;
  'languages:delete': (langCode: string) => Promise<void>;
  'languages:getLanguage': (langCode: string) => Promise<LanguagePack | null>;

  'languages:listSets': () => Promise<LanguageSetSummary[]>;
  'languages:getSet': (id: string) => Promise<LanguageSet | null>;
  'languages:saveSet': (set: LanguageSet) => Promise<void>;
  'languages:createSet': (params: CreateSetParams) => Promise<LanguageSet>;
  'languages:duplicateSet': (sourceId: string, id: string, name: string) => Promise<LanguageSet>;
}

export type { LanguageInvokeContract };
