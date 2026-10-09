/* @layer shared-asset-extraction @kind types */
interface OverworldContext {
  isAreaHead: (i: number) => boolean;
  isSmall: number[];
  awrite: (arr: number[], area: number, key: number, value: number) => void;
}

export type { OverworldContext };
