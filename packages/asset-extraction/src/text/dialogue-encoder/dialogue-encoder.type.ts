/* @layer shared-asset-extraction @kind types */
type CommandParamMap = Record<number, number | null>;

type CommandInfo = [number] | [number, number | CommandParamMap];

type DictionaryLookup = Map<string, Map<string, number>>;

type AlphabetLookup = Map<string, number>;

interface EncodedToken {
  bytes: number[];
  consumed: number;
}

export type { AlphabetLookup, CommandInfo, CommandParamMap, DictionaryLookup, EncodedToken };
