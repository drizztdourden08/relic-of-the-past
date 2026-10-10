/* @layer renderer-components @kind types */
import type { EntryIssue, Token } from '@rotp/languages';

type CacheRow = { tokens: Token[]; issues: EntryIssue[] };

export type { CacheRow };
