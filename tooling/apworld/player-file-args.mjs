/* @layer tooling-scripts @kind logic */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node tooling/apworld/write-player-file.mjs --name <slot> --out <file.yaml> [--seed <text>] '
  + '[--options <file.json|yaml>] [--set key=value ...]';

const optionsOfFile = async (file) => {
  const text = readFileSync(file, 'utf8');
  const extension = path.extname(file).toLowerCase();
  if (extension === '.yaml' || extension === '.yml') {
    const { load } = await import('js-yaml');
    return load(text) ?? {};
  }
  return JSON.parse(text);
};

const optionsOfSets = (sets) => Object.fromEntries(sets.map((entry) => {
  const at = entry.indexOf('=');
  if (at < 1) throw new Error(`--set takes key=value, not "${entry}".`);
  return [entry.slice(0, at).trim(), entry.slice(at + 1).trim()];
}));

const parsePlayerFileArgs = async (argv) => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      name: { type: 'string' },
      out: { type: 'string' },
      seed: { type: 'string' },
      options: { type: 'string' },
      set: { type: 'string', multiple: true },
    },
  });
  if (!values.name || !values.out) throw new Error(`--name and --out are required.\n${USAGE}`);
  const fromFile = values.options ? await optionsOfFile(values.options) : {};
  const fromSets = optionsOfSets([...(values.set ?? []), ...positionals]);
  return { name: values.name, out: path.resolve(values.out), seed: values.seed, plain: { ...fromFile, ...fromSets } };
};

export { parsePlayerFileArgs };
