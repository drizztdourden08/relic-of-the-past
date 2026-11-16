/* @layer shared-asset-extraction @kind types */
import type { LanguageConfig } from '../data/language-data';

type CommandParamMap = Record<number, number | null>;

type CommandInfo = [number] | [number, number | CommandParamMap];

type DictionaryLookup = Map<string, Map<string, number>>;

type AlphabetLookup = Map<string, number>;

type GlyphBytesLookup = ReadonlyMap<string, readonly number[]>;

type EncodeLookups = {
  rev: DictionaryLookup;
  a2i: AlphabetLookup;
  glyphBytes: GlyphBytesLookup;
  info: LanguageConfig;
};

interface EncodedToken {
  bytes: number[];
  consumed: number;
}

export type {
  AlphabetLookup, CommandInfo, CommandParamMap, DictionaryLookup, EncodeLookups, EncodedToken, GlyphBytesLookup,
};
