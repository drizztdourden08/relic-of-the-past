/* @layer shared-game @kind logic */
/**
 * Multiset subtraction: a copy of `list` with ONE occurrence of each entry in
 * `toRemove` taken out. Item pools are multisets (many identical key items),
 * so a Set-difference would remove every copy at once.
 */
const removeOnce = <T>(list: readonly T[], toRemove: readonly T[]): T[] => {
  const out = [...list];
  for (const entry of toRemove) {
    const at = out.indexOf(entry);
    if (at !== -1) out.splice(at, 1);
  }
  return out;
};

export { removeOnce };
