#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { readFileSync } from 'node:fs';
import {
  hex,
  offsetToGbaAddress,
  offsetToSnesAddress,
  parseArgs,
  parseInteger,
  resolveGbaRom,
  resolveSnesRom,
  snesAddressToOffset,
} from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const snesPath = resolveSnesRom(args.snes);
const gbaPath = resolveGbaRom(args.gba);
const snes = readFileSync(snesPath);
const gba = readFileSync(gbaPath);

const read24 = (buffer, offset) => buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);

const findRoomSpan = (roomId) => {
  if (roomId < 0 || roomId >= 320) throw new Error('SNES room must be in the range 0..319');
  const pointerOffset = snesAddressToOffset(0x1f8000 + roomId * 3);
  const roomAddress = read24(snes, pointerOffset);
  const start = snesAddressToOffset(roomAddress);
  let cursor = start + 2;
  for (let layer = 0; layer < 3; layer++) {
    while (cursor + 1 < snes.length) {
      const word = snes[cursor] | (snes[cursor + 1] << 8);
      cursor += 2;
      if (word === 0xffff) break;
      if (word === 0xfff0) {
        while (cursor + 1 < snes.length) {
          const door = snes[cursor] | (snes[cursor + 1] << 8);
          cursor += 2;
          if (door === 0xffff) break;
        }
        break;
      }
      cursor += 1;
    }
  }
  return { start, length: cursor - start, roomAddress };
};

let start;
let length;
let source;
if (args.room !== undefined) {
  const roomId = parseInteger(args.room, 'room');
  const room = findRoomSpan(roomId);
  start = room.start;
  length = room.length;
  source = { kind: 'dungeon-room', roomId, snesAddress: hex(room.roomAddress, 6) };
} else {
  if (args['snes-offset'] === undefined && args['snes-address'] === undefined) {
    throw new Error('Provide --room, --snes-offset, or --snes-address');
  }
  start = args['snes-offset'] !== undefined
    ? parseInteger(args['snes-offset'], 'snes-offset')
    : snesAddressToOffset(parseInteger(args['snes-address'], 'snes-address'));
  length = parseInteger(args.length ?? '256', 'length');
  source = { kind: 'range', snesAddress: hex(offsetToSnesAddress(start), 6) };
}

if (start + length > snes.length) throw new Error('Requested SNES range extends past the ROM');
const chunkSize = parseInteger(args.chunk ?? '16', 'chunk');
const stride = parseInteger(args.stride ?? String(chunkSize), 'stride');
const maxMatches = parseInteger(args['max-matches'] ?? '16', 'max-matches');
if (chunkSize < 4 || chunkSize > length) throw new Error('chunk must be between 4 and the source length');
if (stride < 1) throw new Error('stride must be at least 1');

const findAll = (needle) => {
  const matches = [];
  let at = 0;
  while (matches.length < maxMatches && (at = gba.indexOf(needle, at)) !== -1) {
    matches.push({ offset: hex(at), address: hex(offsetToGbaAddress(at)) });
    at += 1;
  }
  return matches;
};

const bytes = snes.subarray(start, start + length);
const wholeMatches = findAll(bytes);
const chunks = [];
for (let relative = 0; relative + chunkSize <= bytes.length; relative += stride) {
  const matches = findAll(bytes.subarray(relative, relative + chunkSize));
  if (matches.length > 0) {
    chunks.push({
      sourceOffset: hex(start + relative),
      sourceAddress: hex(offsetToSnesAddress(start + relative), 6),
      length: chunkSize,
      matches,
    });
  }
}

console.log(JSON.stringify({
  source: { ...source, path: snesPath, offset: hex(start), length },
  target: { path: gbaPath },
  parameters: { chunkSize, stride, maxMatches },
  wholeMatches,
  matchingChunks: chunks,
}, null, 2));

