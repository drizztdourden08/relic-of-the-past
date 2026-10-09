/* @layer shared-asset-extraction @kind types */
interface DecodedString {
  text: string;
  srcData: number[];
}

type RomByteReader = (addr: number) => number;

export type { DecodedString, RomByteReader };
