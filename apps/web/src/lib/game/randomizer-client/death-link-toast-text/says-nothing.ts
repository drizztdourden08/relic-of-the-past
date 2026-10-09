/* @layer bridge-wasm @kind logic */
const saysNothing = (cause: string, source: string): boolean => {
  const bare = cause.toLowerCase().replace(/[.!]+$/, '');
  const name = source.toLowerCase();
  return bare === '' || bare === name || bare === `${name} died`;
};

export { saysNothing };
