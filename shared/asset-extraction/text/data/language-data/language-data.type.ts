/* @layer shared-asset-extraction @kind types */
interface LanguageConfig {
  id: string;
  alphabet: string[];
  dictionary: string[];
  commandLengths: number[];
  commandNames: string[];
  romAddrs: number[];
  commandStart: number;
  switchBank: number;
  finish: number;
  dictBaseEnc: number;
  dictBaseDec: number;
  escapeCharacter: number | null;
  encoder: 'org' | 'new';
}

type EuLanguageBase = Omit<LanguageConfig, 'id' | 'alphabet' | 'dictionary' | 'romAddrs'>;

export type { EuLanguageBase, LanguageConfig };
