/* @layer bridge-wasm @kind logic */
/**
 * Session dialogue: owns the per-session pool of pre-rendered contextual
 * receipt lines and pushes them into the core's live dialogue memory. The
 * composed blob is the active language's baked bytes verbatim (dictionary and
 * every baked line, class templates included) plus one compressed line per
 * session message, written to the virtual FS and adopted by
 * WasmLoadSessionDialogue (session_dialogue.c). Per-seed text therefore never
 * touches the shared asset blob; the baked class lines at 397-401 remain the
 * fallback for any grant without a pre-rendered line.
 *
 * A line arrives as candidates, fullest first (receipt-line.type.ts); the
 * composer keeps the first one that fits the three visible rows against the
 * language's real glyph widths. The pool is re-composed whenever the session
 * re-renders its lines (the tracker moved a found/total number): the ids
 * stay put because the count and order do, and the swap is safe between
 * frames because the text engine copies a line out of the blob when a
 * message opens, never while it shows. Encoded lines are cached by text, so
 * a refresh re-encodes only what changed.
 */

import { compressStrings } from '@shared/asset-extraction/text/dialogue-encoder';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import {
  RANDOMIZER_MSG_BASE, randomizerTemplateTexts,
} from '@shared/asset-extraction/text/data/randomizer-templates';
import { packPackedBytes } from '@shared/asset-extraction/packed-bytes';
import { receiptLineCandidates } from '@shared/randomizer/receipt-text/receipt-line.type';
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { readActiveDialogue } from './active-dialogue';
import { fitReceiptLine, sanitizeForAlphabet, wrapMessageText } from './wrap-message';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { ActiveDialogue } from './active-dialogue';

const SESSION_FILE = '/session_dialogue.bin';

let sessionLines: ReceiptLine[] = [];
let active: ActiveDialogue | null = null;
/** Message id of the first session line in the composed blob. */
let baseId: number | null = null;
/** Prepared (wrapped) text → its compressed chunk, for cheap re-composition. */
const encoded = new Map<string, Uint8Array>();

/** Baked chunks with every template line guaranteed present from 397 up. */
const baseChunksOf = (dialogue: ActiveDialogue): Uint8Array[] | null => {
  const { code, lineChunks } = dialogue;
  if (lineChunks.length < RANDOMIZER_MSG_BASE) return null;
  const templates = randomizerTemplateTexts(code);
  const baked = lineChunks.length - RANDOMIZER_MSG_BASE;
  if (baked >= templates.length) return lineChunks;
  // A blob from an older bake stops short of the newer templates: append the ones it
  // lacks so the fixed template ids stay correct below the session lines. Without this
  // a session line would sit at an id the core shows as a template line.
  return [...lineChunks, ...compressStrings([...templates.slice(baked)], code)];
};

/** The candidate that fits the box, sanitized and wrapped into line commands. */
const prepareLine = (line: ReceiptLine, alphabet: readonly string[], dialogue: ActiveDialogue): string => {
  const candidates = receiptLineCandidates(line).map((text) => sanitizeForAlphabet(text, alphabet));
  return wrapMessageText(fitReceiptLine(candidates, alphabet, dialogue.fontWidths), alphabet, dialogue.fontWidths);
};

const encodeLines = (prepared: readonly string[], code: string): Uint8Array[] => {
  const missing = [...new Set(prepared.filter((text) => !encoded.has(text)))];
  compressStrings(missing, code).forEach((chunk, i) => encoded.set(missing[i], chunk));
  return prepared.map((text) => encoded.get(text) as Uint8Array);
};

/** Compose the current pool into a blob and hand it to the core. False = kept baked. */
const compose = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  active ??= readActiveDialogue(mod);
  const dialogue = active;
  if (dialogue === null) {
    log.randomizer('[Randomizer] Session dialogue skipped: asset blob unreadable', 'warn');
    return false;
  }
  const config = kLanguages[dialogue.code];
  if (!config) {
    // A Language Studio set compiles under its own id; its base encoder is not
    // recoverable here, so the class template lines stay the fallback.
    log.randomizer(`[Randomizer] Session dialogue skipped: no encoder for language "${dialogue.code}"`, 'warn');
    return false;
  }
  const baseChunks = baseChunksOf(dialogue);
  if (baseChunks === null) {
    log.randomizer('[Randomizer] Session dialogue skipped: baked dialogue is incomplete', 'warn');
    return false;
  }
  try {
    const prepared = sessionLines.map((line) => prepareLine(line, config.alphabet, dialogue));
    const blob = packPackedBytes([
      dialogue.dictPacked,
      packPackedBytes([...baseChunks, ...encodeLines(prepared, dialogue.code)]),
    ]);
    mod.FS.writeFile(SESSION_FILE, blob);
    // Returns the adopted blob's line count (0 = refused, baked blob kept).
    const adopted = mod.ccall('WasmLoadSessionDialogue', 'number', [], []);
    if (adopted < baseChunks.length + sessionLines.length) return false;
    baseId = adopted - sessionLines.length;
    return true;
  } catch (error) {
    log.randomizer(`[Randomizer] Session dialogue compose failed: ${String(error)}`, 'warn');
    return false;
  }
};

/** Replace the pool with |lines|; returns their message ids, or null when kept baked. */
const setSessionReceiptMessages = (lines: readonly ReceiptLine[]): number[] | null => {
  sessionLines = [...lines];
  if (!compose()) return null;
  return sessionLines.map((_, i) => (baseId as number) + i);
};

/** Append one line (a runtime arrival, e.g. an online receipt); null when kept baked. */
const appendSessionReceiptMessage = (line: ReceiptLine): number | null => {
  sessionLines.push(line);
  if (!compose()) { sessionLines.pop(); return null; }
  return (baseId as number) + sessionLines.length - 1;
};

/** Drop the pool and restore the baked dialogue blob (session stop). */
const clearSessionDialogue = (): void => {
  sessionLines = [];
  active = null;
  baseId = null;
  encoded.clear();
  const mod = getModule();
  if (mod) mod.ccall('WasmClearSessionDialogue', null, [], []);
};

export { appendSessionReceiptMessage, clearSessionDialogue, setSessionReceiptMessages };
