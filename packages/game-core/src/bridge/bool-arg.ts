/* @layer bridge-wasm @kind logic */
const boolArg = (b: boolean): { argTypes: string[]; args: unknown[] } => ({ argTypes: ['number'], args: [b ? 1 : 0] });

export { boolArg };
