/* @layer shared-asset-extraction @kind logic */
/**
 * Core ROM types for SNES ROM loading and access.
 */

/** Supported ROM language/region variants */
type RomLanguage =
  | 'us' | 'de' | 'fr' | 'fr-c' | 'en'
  | 'es' | 'pl' | 'pt' | 'redux' | 'nl' | 'sv';

/** ROM identification entry */
interface RomIdentEntry {
  language: RomLanguage;
  description: string;
}

/** SHA1 hash (uppercase hex) → ROM identification */
type RomHashTable = Record<string, RomIdentEntry>;

/**
 * Loaded ROM data — the primary dependency injected into all extraction functions.
 * Replaces the Python global `ROM` singleton.
 */
interface RomData {
  /** Raw ROM bytes (header stripped) */
  readonly bytes: Buffer;
  /** Detected language/region */
  readonly language: RomLanguage;
  /** ROM description string */
  readonly description: string;

  /** Read a single byte at SNES address */
  getByte(ea: number): number;
  /** Read a 16-bit little-endian word at SNES address */
  getWord(ea: number): number;
  /** Read a 24-bit little-endian value at SNES address */
  get24(ea: number): number;
  /** Read signed 8-bit value at SNES address */
  getInt8(ea: number): number;
  /** Read signed 16-bit value at SNES address */
  getInt16(ea: number): number;
  /** Read N bytes starting at SNES address (handles bank boundaries) */
  getBytes(addr: number, n: number): Buffer;
  /** Read N 16-bit words starting at SNES address (handles bank boundaries) */
  getWords(addr: number, n: number): number[];
}

export type {
  RomData,
  RomHashTable,
  RomIdentEntry,
  RomLanguage
};
