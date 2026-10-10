/* @layer shared-game @kind logic */
const holdAt = (holds: readonly number[], index: number): number => {
  const hold = holds[index];
  if (hold === undefined) throw new Error(`no hold time for beat ${index}`);
  return hold;
};

export { holdAt };
