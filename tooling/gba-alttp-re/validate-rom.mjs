#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { readFileSync } from 'node:fs';
import {
  gbaAddressToOffset,
  hashBuffer,
  hex,
  hexBytes,
  loadAnchors,
  parseArgs,
  resolveGbaRom,
} from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const romPath = resolveGbaRom(args.rom);
const rom = readFileSync(romPath);
const known = loadAnchors();
const md5 = hashBuffer(rom, 'md5');
const sha256 = hashBuffer(rom, 'sha256');

const ascii = (start, length) => rom.subarray(start, start + length).toString('ascii').replace(/\0+$/, '');
const header = {
  title: ascii(0xa0, 12),
  gameCode: ascii(0xac, 4),
  makerCode: ascii(0xb0, 2),
  softwareVersion: rom[0xbc],
};

const romAnchors = known.anchors
  .filter(anchor => anchor.kind.startsWith('rom-'))
  .map(anchor => {
    const address = Number.parseInt(anchor.address, 16);
    const offset = gbaAddressToOffset(address);
    const inRange = offset < rom.length;
    return {
      ...anchor,
      offset: hex(offset),
      inRange,
      bytes: inRange ? hexBytes(rom.subarray(offset, Math.min(offset + 16, rom.length))) : null,
    };
  });

const result = {
  romPath,
  size: rom.length,
  hashes: { md5, sha256 },
  header,
  profileMatch: {
    size: rom.length === known.romProfile.size,
    md5: md5 === known.romProfile.md5,
    sha256: sha256 === known.romProfile.sha256,
    gameCode: header.gameCode === known.romProfile.gameCode,
    revision: header.softwareVersion === known.romProfile.revision,
  },
  anchorValidation: {
    status: 'range-and-fingerprint-only',
    note: 'Runtime meaning still requires debugger traces or RAM observations.',
    rom: romAnchors,
    ram: known.anchors.filter(anchor => anchor.kind === 'iwram'),
  },
};

console.log(JSON.stringify(result, null, 2));
if (Object.values(result.profileMatch).some(match => !match)) process.exitCode = 2;

