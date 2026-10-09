/* @layer renderer-lib @kind types */
import type { DecodedLine } from '@shared/asset-extraction/text/menu-text';

type DecodedText = {
  language: string;
  menu: DecodedLine[];
  credits: DecodedLine[];
};

export type { DecodedText };
