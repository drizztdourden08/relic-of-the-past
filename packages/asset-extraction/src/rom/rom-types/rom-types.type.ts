/* @layer shared-asset-extraction @kind types */
type RomLanguage = 'us' | 'de' | 'fr' | 'fr-c' | 'en' | 'ja';

type RomRevision = 0 | 1 | 2;

interface RomIdentEntry {
  language: RomLanguage;
  revision: RomRevision;
  description: string;
}

type RomHashTable = Record<string, RomIdentEntry>;

interface RomData {
  readonly bytes: Buffer;
  readonly language: RomLanguage;
  readonly revision: RomRevision;
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
  RomLanguage,
  RomRevision,
};
