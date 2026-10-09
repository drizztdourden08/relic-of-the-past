/* @layer renderer-components @kind types */
import type { EntryIssue, Token } from '@shared/game/language';

type CacheRow = { tokens: Token[]; issues: EntryIssue[] };

export type { CacheRow };
