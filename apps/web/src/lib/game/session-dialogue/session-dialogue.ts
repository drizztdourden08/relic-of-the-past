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
 *
 * The pool has two parts. The arrivals come first: a fixed ring of slots for
 * the lines appended at runtime (an online receipt), each taken when its delivery
 * reaches the front of the queue and handed back when that delivery completes
 * (arrival-ring.ts, server-delivery.ts).
 * The planned lines follow, and a set replaces them whatever their count, since
 * the ring in front never changes size and so no set can move an arrival.
 */

import { compressStrings } from '@shared/asset-extraction/text/dialogue-encoder';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import {
  RANDOMIZER_MSG_BASE, randomizerTemplateTexts,
} from '@shared/asset-extraction/text/data/randomizer-templates';
import { packPackedBytes } from '@shared/asset-extraction/packed-bytes';
import { isChoiceLine, isPageLine, receiptLineCandidates } from '@shared/randomizer/receipt-text/receipt-line.type';
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { readActiveDialogue } from './active-dialogue';
import { ARRIVAL_SLOTS, createArrivalRing, releaseSlot, takeSlot } from './arrival-ring';
import { choiceMessageText } from './choice-message';
import { toDialogueText } from './dialogue-text';
import { clearExtraGlyphs, sessionCharset } from './extra-glyphs';
import { compressMarkedStrings } from './highlight-bytes';
import { pageMessageText } from './page-message';
import { fitReceiptLine, wrapMessageText } from './wrap-message';
import type { DialogueCharset } from '@shared/game/dialog/dialogue-charset';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { ActiveDialogue } from './active-dialogue';
import type { ArrivalRing } from './arrival-ring';

const SESSION_FILE = '/session_dialogue.bin';

/** The lines a set replaces, in id order, behind the arrival ring. */
let plannedLines: ReceiptLine[] = [];
/** The runtime arrivals; only a session stop drops the ring. */
let arrivals: ArrivalRing = createArrivalRing();
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

/**
 * The candidate that fits the box, made drawable (dialogue-text.ts) and wrapped into line
 * commands. A yes/no line lays its question out above its two answers (choice-message.ts),
 * a detail page opens on a key and scrolls in (page-message.ts).
 */
const prepareLine = (line: ReceiptLine, charset: DialogueCharset): string => {
  const candidates = receiptLineCandidates(line).map((text) => toDialogueText(text, charset));
  if (isChoiceLine(line)) return choiceMessageText(line, candidates, charset);
  if (isPageLine(line)) return pageMessageText(candidates, charset);
  const { alphabet, widths } = charset;
  return wrapMessageText(fitReceiptLine(candidates, alphabet, widths), alphabet, widths);
};

const encodeLines = (prepared: readonly string[], code: string): Uint8Array[] => {
  const missing = [...new Set(prepared.filter((text) => !encoded.has(text)))];
  compressMarkedStrings(missing, code).forEach((chunk, i) => encoded.set(missing[i], chunk));
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
  const pool = [...arrivals.lines, ...plannedLines];
  try {
    const charset = sessionCharset(mod, config.alphabet, dialogue.fontWidths);
    const prepared = pool.map((line) => prepareLine(line, charset));
    const blob = packPackedBytes([
      dialogue.dictPacked,
      packPackedBytes([...baseChunks, ...encodeLines(prepared, dialogue.code)]),
    ]);
    mod.FS.writeFile(SESSION_FILE, blob);
    // Returns the adopted blob's line count (0 = refused, baked blob kept).
    const adopted = mod.ccall('WasmLoadSessionDialogue', 'number', [], []);
    if (adopted < baseChunks.length + pool.length) return false;
    baseId = adopted - pool.length;
    return true;
  } catch (error) {
    log.randomizer(`[Randomizer] Session dialogue compose failed: ${String(error)}`, 'warn');
    return false;
  }
};

/**
 * Replace the planned lines with |lines|, of any count; returns their message ids, or null when
 * kept baked. The arrivals still pending keep their ids and their text.
 */
const setSessionReceiptMessages = (lines: readonly ReceiptLine[]): number[] | null => {
  const previous = plannedLines;
  plannedLines = [...lines];
  if (!compose()) {
    plannedLines = previous;
    return null;
  }
  return lines.map((_, i) => (baseId as number) + ARRIVAL_SLOTS + i);
};

/**
 * Put one runtime arrival (an online receipt) in a free ring slot; its message id, or null when
 * kept baked or while every slot is still held by a pending delivery. Hand the id back with
 * releaseSessionReceiptMessage once that delivery completes.
 */
const appendSessionReceiptMessage = (line: ReceiptLine): number | null => {
  const previous = [...arrivals.lines];
  const slot = takeSlot(arrivals, line);
  if (slot === null) {
    log.randomizer('[Randomizer] Session dialogue: every received-item line is still pending', 'warn');
    return null;
  }
  if (!compose()) {
    releaseSlot(arrivals, slot);
    arrivals.lines[slot] = previous[slot];
    return null;
  }
  return (baseId as number) + slot;
};

/** The delivery holding |messageId| completed: its slot is free for the next arrival. */
const releaseSessionReceiptMessage = (messageId: number): void => {
  if (baseId !== null) releaseSlot(arrivals, messageId - baseId);
};

/** Drop the pool and restore the baked dialogue blob (session stop). */
const clearSessionDialogue = (): void => {
  plannedLines = [];
  arrivals = createArrivalRing();
  active = null;
  baseId = null;
  encoded.clear();
  const mod = getModule();
  clearExtraGlyphs(mod);
  if (mod) mod.ccall('WasmClearSessionDialogue', null, [], []);
};

export {
  appendSessionReceiptMessage, clearSessionDialogue, prepareLine, releaseSessionReceiptMessage,
  setSessionReceiptMessages,
};
