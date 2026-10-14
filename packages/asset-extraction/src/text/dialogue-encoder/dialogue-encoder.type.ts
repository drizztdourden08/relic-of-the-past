/* @layer shared-asset-extraction @kind types */
import type { LanguageConfig } from '../data/language-data';

type CommandParamMap = Record<number, number | null>;

type CommandInfo = [number] | [number, number | CommandParamMap];

type DictionaryLookup = Map<string, Map<string, number>>;

type AlphabetLookup = Map<string, number>;

type EncodeLookups = {
  rev: DictionaryLookup;
  a2i: AlphabetLookup;
  info: LanguageConfig;
};

interface EncodedToken {
  bytes: number[];
  consumed: number;
}

export type { AlphabetLookup, CommandInfo, CommandParamMap, DictionaryLookup, EncodeLookups, EncodedToken };
