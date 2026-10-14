/* @layer renderer-components @kind logic */
const skipNote = (result: { skippedNested?: number; skippedDuplicate?: number }): string => {
  const parts: string[] = [];
  if (result.skippedNested) parts.push(`${result.skippedNested} in subfolders (alternates and extras)`);
  if (result.skippedDuplicate) parts.push(`${result.skippedDuplicate} already claimed by another file`);
  return parts.length === 0 ? '' : ` (skipped ${parts.join(', ')})`;
};

export { skipNote };
