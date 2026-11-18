/* @layer shared-types @kind types */
interface LanguageInvokeContract {
  'app:language:set': (tag: string) => Promise<void>;
}

export type { LanguageInvokeContract };
