/* @layer renderer-components @kind types */
import type { Token } from '@shared/game/language';

type EntryRewrite = {
  entryId: number;
  tokens: Token[];
};

export type { EntryRewrite };
