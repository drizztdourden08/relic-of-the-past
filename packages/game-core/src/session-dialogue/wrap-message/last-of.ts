/* @layer bridge-wasm @kind logic */
const lastOf = (texts: readonly string[], missing: string): string => {
  const last = texts.at(-1);
  if (last === undefined) throw new Error(missing);
  return last;
};

export { lastOf };
