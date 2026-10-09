/* @layer shared-asset-extraction @kind types */
type RomLanguage =
  | 'us' | 'de' | 'fr' | 'fr-c' | 'en'
  | 'es' | 'pl' | 'pt' | 'redux' | 'nl' | 'sv';

interface RomIdentEntry {
  language: RomLanguage;
  description: string;
}

type RomHashTable = Record<string, RomIdentEntry>;

interface RomData {
  readonly bytes: Buffer;
  readonly language: RomLanguage;
  readonly description: string;

  getByte(ea: number): number;
  getWord(ea: number): number;
  get24(ea: number): number;
  getInt8(ea: number): number;
  getInt16(ea: number): number;
  getBytes(addr: number, n: number): Buffer;
  getWords(addr: number, n: number): number[];
}

export type {
  RomData,
  RomHashTable,
  RomIdentEntry,
  RomLanguage
};
