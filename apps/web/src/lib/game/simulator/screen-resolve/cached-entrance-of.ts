/* @layer bridge-wasm @kind logic */
const cachedEntranceOf = (screenId: string): string => {
  const at = screenId.indexOf('^');
  return at === -1 ? '' : screenId.slice(at);
};

export { cachedEntranceOf };
