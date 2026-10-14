/* @layer site-kit @kind logic */
import type { ParsedGroup } from './problem-of.type';

const problemOf = (parsed: ParsedGroup): string | null => {
  if (parsed.success) return null;
  return parsed.error.issues[0]?.message ?? 'Check the fields.';
};

export { problemOf };
