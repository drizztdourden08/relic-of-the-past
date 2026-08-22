/* @layer shared-asset-extraction @kind logic */
/**
 * Dialogue encoder — compresses dialogue strings back to ROM format.
 *
 * Ported from: upstream's text_compression.py compress_strings() + encoders
 */
import type { LanguageConfig } from './data/language-data';
import { kLanguages } from './data/language-data';

// ─── Command encoding ───

const orgEncoder = (cmd: string, param: number | null, info: LanguageConfig): number[] => {
  const cmdIndex = info.commandNames.indexOf(cmd);
  if (cmdIndex < 0) throw new Error(`Invalid cmd: ${cmd}`);
  const expectedLen = info.commandLengths[cmdIndex];
  if (expectedLen !== (param === null ? 1 : 2)) {
    throw new Error(`Invalid cmd params: ${cmd} ${param}`);
  }
  if (param === null) {
    return [cmdIndex + info.commandStart];
  }
  return [cmdIndex + info.commandStart, param];
};

/** Command info table for the "new" encoder format */
const kCmdInfo: Record<string, [number] | [number, number | Record<number, number | null>]> = {
  Scroll: [0x80],
  Waitkey: [0x81],
  '1': [0x82],
  '2': [0x83],
  '3': [0x84],
  Name: [0x85],
  Wait: [0x87, Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, i + 0x00]))],
  Color: [0x87, Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, i + 0x10]))],
  Number: [0x87, Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, i + 0x20]))],
  Speed: [0x87, Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, i + 0x30]))],
  Sound: [0x87, { 45: 0x40, 64: null } as Record<number, number | null>],
  Choose: [0x87, 0x80],
  Choose2: [0x87, 0x81],
  Choose3: [0x87, 0x82],
  Selchg: [0x87, 0x83],
  Item: [0x87, 0x84],
  NextPic: [0x87, 0x85],
  Window: [0x87, { 0: null, 2: 0x86 } as Record<number, number | null>],
  Position: [0x87, { 0: 0x87, 1: 0x88 } as Record<number, number | null>],
  ScrollSpd: [0, { 0: null } as Record<number, number | null>],
};

const newEncoder = (cmd: string, param: number | null): number[] => {
  const info = kCmdInfo[cmd];
  if (!info) throw new Error(`Invalid cmd: ${cmd}`);
  if (info.length <= 1 || typeof info[1] === 'number') {
    if (param !== null) throw new Error(`Invalid cmd params: ${cmd} ${param}`);
    return [...info] as number[];
  } else {
    if (param === null || !info[1] || !(param in (info[1] as Record<number, number | null>))) {
      throw new Error(`Invalid cmd params: ${cmd} ${param}`);
    }
    const r = (info[1] as Record<number, number | null>)[param];
    return r !== null ? [info[0], r] : [];
  }
};

const kEncoders = { org: orgEncoder, new: newEncoder };

// ─── Greedy compression ───

const encodeGreedyFromDict = (s: string, i: number, rev: Map<string, Map<string, number>>, a2i: Map<string, number>, info: LanguageConfig): { bytes: number[]; consumed: number } => {
  const a = s.slice(i);

  // Try dictionary match first (longest match via first-char lookup)
  const charMap = rev.get(a[0]);
  if (charMap) {
    for (const [key, val] of Array.from(charMap)) {
      if (a.startsWith(key)) {
        return { bytes: [val + info.dictBaseEnc], consumed: key.length };
      }
    }
  }

  // Command token
  if (a[0] === '[') {
    const endBracket = a.indexOf(']');
    let cmd = a.slice(1, endBracket);
    let param: number | null = null;
    const cmdLen = cmd.length;

    // Check if the full bracket expression is a known alphabet entry
    const fullToken = a.slice(0, cmdLen + 2);
    const alphaIdx = a2i.get(fullToken);
    if (alphaIdx !== undefined) {
      return { bytes: [alphaIdx], consumed: cmdLen + 2 };
    }

    // Parse command with optional parameter
    if (cmd.includes(' ')) {
      const spaceIdx = cmd.indexOf(' ');
      param = parseInt(cmd.slice(spaceIdx + 1), 10);
      cmd = cmd.slice(0, spaceIdx);
    }

    const encoder = info.encoder === 'org'
      ? (c: string, p: number | null) => orgEncoder(c, p, info)
      : newEncoder;
    return { bytes: encoder(cmd, param), consumed: cmdLen + 2 };
  }

  // Plain alphabet character
  const idx = a2i.get(a[0]);
  if (idx === undefined) {
    throw new Error(`Character '${a[0]}' not found in alphabet for language ${info.id}`);
  }
  return { bytes: [idx], consumed: 1 };
};

const compressStrings = (strings: string[], lang = 'us'): Uint8Array[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);

  // Build reverse dictionary lookup: first char → (full string → index)
  const rev = new Map<string, Map<string, number>>();
  for (let idx = 0; idx < info.dictionary.length; idx++) {
    const word = info.dictionary[idx];
    if (!rev.has(word[0])) rev.set(word[0], new Map());
    rev.get(word[0])!.set(word, idx);
  }

  // Build alphabet → index lookup
  const a2i = new Map<string, number>();
  for (let idx = 0; idx < info.alphabet.length; idx++) {
    a2i.set(info.alphabet[idx], idx);
  }

  return strings.map(s => {
    const r: number[] = [];
    let i = 0;
    while (i < s.length) {
      const { bytes, consumed } = encodeGreedyFromDict(s, i, rev, a2i, info);
      r.push(...bytes);
      i += consumed;
    }
    return new Uint8Array(r);
  });
};

const encodeDictionary = (lang = 'us'): Uint8Array[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);

  const charToIdx = new Map<string, number>();
  for (let i = 0; i < info.alphabet.length; i++) {
    charToIdx.set(info.alphabet[i], i);
  }

  return info.dictionary.map(line => {
    const bytes: number[] = [];
    for (const ch of line) {
      const idx = charToIdx.get(ch);
      if (idx === undefined) throw new Error(`Dict char '${ch}' not in alphabet for ${lang}`);
      bytes.push(idx);
    }
    return new Uint8Array(bytes);
  });
};

export { compressStrings, encodeDictionary, kCmdInfo };
