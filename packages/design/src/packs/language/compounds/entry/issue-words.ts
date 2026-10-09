/* @layer renderer-components @kind logic */
import type { EntryIssue } from '@rotp/languages';

const issueWords = (issue: EntryIssue): string => (
  issue.kind === 'char-not-in-alphabet'
    ? `"${issue.ch}" is not in this set's alphabet`
    : `no variable named "${issue.key}"`
);

export { issueWords };
