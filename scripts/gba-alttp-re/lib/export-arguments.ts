/* @layer scripts @kind tooling */
import { VALUE_KEYS } from './export-arguments.constants';
import type { CliArguments } from './export-arguments.type';

const parseArguments = (): CliArguments => {
  const result: CliArguments = {};
  const values = process.argv.slice(2);
  let i = 0;
  for (let key = values[i]; key !== undefined; key = values[++i]) {
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    if (key === '--allow-unknown-rom') {
      result['allow-unknown-rom'] = true;
      continue;
    }
    const value = values[++i];
    if (!value) throw new Error(`Missing value for ${key}`);
    const field = Object.hasOwn(VALUE_KEYS, key) ? VALUE_KEYS[key] : undefined;
    if (field === undefined) throw new Error(`Unknown argument: ${key}`);
    result[field] = value;
  }
  return result;
};

export { parseArguments };
