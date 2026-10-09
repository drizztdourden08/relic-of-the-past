#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { compileAlttpAssetSet } from '@rotp/asset-extraction';
import { loadGbaAlttpRomFromBuffer } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction';

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

const build = async (): Promise<void> => {
  const set = await compileAlttpAssetSet({
    snes: loadRomFromBuffer(readFileSync(snesPath)),
    gbaAlttp: loadGbaAlttpRomFromBuffer(readFileSync(gbaPath)),
  });

  for (const outcome of set.supplements) {
    if (!outcome.ok) throw new Error(`The ${outcome.id} supplement was not produced: ${outcome.reason}`);
  }
  const containers = set.supplements.flatMap(outcome => (outcome.ok ? [Buffer.from(outcome.container)] : []));

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, Buffer.concat([set.base, ...containers]));
  console.log(`Built playable SNES + GBA ALttP assets at ${outputPath}`);
};

build().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

