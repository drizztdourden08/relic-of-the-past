/* @layer shared-input @kind logic */
const withoutKey = <T>(table: Readonly<Record<string, T>>, key: string): Record<string, T> => {
  const next = { ...table };
  delete next[key];
  return next;
};

export { withoutKey };
