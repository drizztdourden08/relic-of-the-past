/* @layer renderer-components @kind logic */
const summarise = (values: readonly number[]): string => {
  const booleanish = values.every((v) => v === 0 || v === 1);
  if (booleanish) return `true on ${values.filter((v) => v === 1).length} of ${values.length}`;
  const full = values.filter((v) => v >= 1).length;
  const empty = values.filter((v) => v <= 0).length;
  if (full + empty === values.length) return `${full} full · ${empty} empty`;
  return `${Math.min(...values)} ... ${Math.max(...values)}`;
};

export { summarise };
