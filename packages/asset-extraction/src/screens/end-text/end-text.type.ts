/* @layer shared-asset-extraction @kind types */
import type { ScreenPayload } from '../screen-payload.type';

interface WordIndexer {
  readonly indexOf: (word: number) => number;
  readonly toMap: () => Uint16Array;
}

interface ConvertedCredits {
  readonly text: Uint8Array;
  readonly offsets: Uint16Array;
}

interface ConvertedEnding {
  readonly offsets: Uint16Array;
  readonly data: Uint8Array;
}

type EndText = Pick<ScreenPayload, 'credits' | 'endingCaptions'>;

export type { ConvertedCredits, ConvertedEnding, EndText, WordIndexer };
