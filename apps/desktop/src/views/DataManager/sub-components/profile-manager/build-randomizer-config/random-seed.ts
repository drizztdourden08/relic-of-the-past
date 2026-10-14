/* @layer renderer-components @kind logic */
const randomSeed = (): string => {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export { randomSeed };
