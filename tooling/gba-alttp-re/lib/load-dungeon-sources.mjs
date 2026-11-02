/* @layer scripts @kind tooling */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs, resolveGbaRom, resolveSnesRom } from './common.mjs';

const loadDungeonSources = (defaultOut) => {
  const args = parseArgs(process.argv.slice(2));
  const gbaPath = resolveGbaRom(args.gba ?? args.rom);
  const snesPath = resolveSnesRom(args.snes);
  const outPath = resolve(args.out ?? defaultOut);
  return {
    gbaPath,
    snesPath,
    outPath,
    gba: readFileSync(gbaPath),
    snes: readFileSync(snesPath),
  };
};

export { loadDungeonSources };
