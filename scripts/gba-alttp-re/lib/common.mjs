/* @layer scripts @kind tooling */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(TOOL_DIR, '..', '..');
const DEFAULT_GBA_ROM = resolve(
  REPO_ROOT,
  'test-roms',
  'Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba',
);
const DEFAULT_SNES_ROM = resolve(
  REPO_ROOT,
  'test-roms',
  'Legend of Zelda, The - A Link to the Past (USA).sfc',
);

const parseInteger = (value, label = 'value') => {
  if (typeof value === 'number' && Number.isSafeInteger(value)) return value;
  if (typeof value !== 'string' || !/^(?:0x[0-9a-f]+|\d+)$/i.test(value)) {
    throw new Error(`${label} must be a decimal integer or 0x-prefixed hexadecimal integer`);
  }
  return Number.parseInt(value, value.toLowerCase().startsWith('0x') ? 16 : 10);
};

const parseArgs = (argv) => {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [rawKey, inlineValue] = token.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      args[rawKey] = argv[++i];
    } else {
      args[rawKey] = true;
    }
  }
  return args;
};

const requireFile = (path, label) => {
  const absolute = resolve(path);
  if (!existsSync(absolute)) throw new Error(`${label} not found: ${absolute}`);
  return absolute;
};

const resolveGbaRom = (arg) => requireFile(
  arg ?? process.env.ALTTP_GBA_ROM ?? DEFAULT_GBA_ROM,
  'GBA ROM',
);

const resolveSnesRom = (arg) => requireFile(
  arg ?? process.env.ALTTP_SNES_ROM ?? DEFAULT_SNES_ROM,
  'SNES ROM',
);

const hashBuffer = (buffer, algorithm) => createHash(algorithm).update(buffer).digest('hex');

const gbaAddressToOffset = (address) => {
  const normalized = address & 0x01ffffff;
  if (address < 0x08000000 || address > 0x09ffffff) {
    throw new Error(`Address 0x${address.toString(16)} is outside the GBA Game Pak ROM windows`);
  }
  return normalized;
};

const offsetToGbaAddress = (offset) => {
  if (offset < 0 || offset > 0x01ffffff) throw new Error('GBA ROM offset is out of range');
  return 0x08000000 + offset;
};

const snesAddressToOffset = (address) => {
  if ((address & 0x8000) === 0) {
    throw new Error(`Invalid LoROM address 0x${address.toString(16)}: bit 15 is not set`);
  }
  return ((address >>> 16) & 0x7f) * 0x8000 + (address & 0x7fff);
};

const offsetToSnesAddress = (offset) => {
  if (offset < 0 || offset > 0x3fffff) throw new Error('SNES LoROM offset is out of range');
  return 0x800000 | ((offset >>> 15) << 16) | (offset & 0x7fff) | 0x8000;
};

const hex = (value, width = 8) => `0x${value.toString(16).toUpperCase().padStart(width, '0')}`;
const hexBytes = (buffer) => Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join(' ');

const loadAnchors = () => JSON.parse(readFileSync(resolve(TOOL_DIR, 'anchors.json'), 'utf8'));

export {
  DEFAULT_GBA_ROM,
  DEFAULT_SNES_ROM,
  REPO_ROOT,
  TOOL_DIR,
  gbaAddressToOffset,
  hashBuffer,
  hex,
  hexBytes,
  loadAnchors,
  offsetToGbaAddress,
  offsetToSnesAddress,
  parseArgs,
  parseInteger,
  requireFile,
  resolveGbaRom,
  resolveSnesRom,
  snesAddressToOffset,
};

