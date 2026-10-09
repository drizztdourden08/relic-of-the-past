/* @layer bridge-wasm @kind logic */
import type { NumberCallArgs } from './num-args.type';

const numArgs = (...args: number[]): NumberCallArgs =>
  ({ argTypes: args.map(() => 'number'), args });

export { numArgs };
