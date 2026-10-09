/* @layer renderer-lib @kind types */
import type { DecodedLine } from '@rotp/asset-extraction';

type DecodedText = {
  language: string;
  menu: DecodedLine[];
  credits: DecodedLine[];
};

export type { DecodedText };
