/* @layer renderer-widgets @kind logic */
const dedupeById = <T extends { id: string }>(records: readonly (T | undefined)[]): readonly T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const record of records) {
    if (!record || seen.has(record.id)) continue;
    seen.add(record.id);
    out.push(record);
  }
  return out;
};

export { dedupeById };
