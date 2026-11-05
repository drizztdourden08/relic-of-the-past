/* @layer bridge-wasm @kind logic */
const suppressSink: { current: ((key: string) => void) | null } = { current: null };

export { suppressSink };
