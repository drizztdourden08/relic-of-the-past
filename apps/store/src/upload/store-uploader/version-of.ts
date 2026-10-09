/* @layer store-site @kind logic */
const versionOf = (n: number | null): number => {
  if (n === null) throw new Error('The version has no number.');
  return n;
};

export { versionOf };
