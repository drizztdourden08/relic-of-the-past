#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { compileAlttpAssetSet } from '../../shared/asset-extraction/compile-alttp-asset-set';
import { loadGbaAlttpRomFromBuffer } from '../../shared/asset-extraction/rom/gba-rom';
import { loadRomFromBuffer } from '../../shared/asset-extraction/rom/rom-loader';

interface Arguments {
  snes?: string;
  gba?: string;
  out?: string;
}

const parseArguments = (): Arguments => {
  const result: Arguments = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const value = args[i + 1];
    if (!value) throw new Error(`Missing value for ${args[i]}`);
    if (args[i] === '--snes') result.snes = value;
    else if (args[i] === '--gba') result.gba = value;
    else if (args[i] === '--out') result.out = value;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  return result;
};

const args = parseArguments();
const snesPath = resolve(args.snes ?? 'test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc');
const gbaPath = resolve(args.gba ?? 'test-roms/Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba');
const outputPath = resolve(args.out ?? 'core/wasm-build/assets/zelda3_assets.dat');
const set = compileAlttpAssetSet({
  snes: loadRomFromBuffer(readFileSync(snesPath)),
  gbaAlttp: loadGbaAlttpRomFromBuffer(readFileSync(gbaPath)),
});
if (!set.gbaSupplement) throw new Error('The GBA supplement was not produced');

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, Buffer.concat([set.base, set.gbaSupplement]));
console.log(`Built playable SNES + GBA ALttP assets at ${outputPath}`);

