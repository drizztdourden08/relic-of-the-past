/* @layer tests @kind test */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compressStrings, kLanguages } from '@rotp/asset-extraction';
import { HIGHLIGHT_END, HIGHLIGHT_PRIMARY, HIGHLIGHT_SECONDARY, stripHighlight, receiptLineCandidates, compressMarkedStrings, wrapMessageText, wrapRows, toDialogueText, DEFAULT_SETTINGS } from '@rotp/game-core';
import { primary, secondary, renderReceiptMessage, renderFromServer, renderJunk, renderOnline, renderProgressive, pondDemandLinesOf, renderCapacityStep, foreignItemLine } from '@rotp/randomizer';
import { hexToSnes15, dialogueCharsetOf } from '@rotp/game-data';
import type { ReceiptLine } from '@rotp/game-core';
import { REPO_ROOT } from '../repo-root';
import { required } from '../required';

const US = required(kLanguages.us, 'US language');
const BANG = String.fromCodePoint(0x21);
const WIDTHS = new Uint8Array(US.alphabet.length).fill(6);
const US_CHARSET = dialogueCharsetOf(US.alphabet, WIDTHS, []);

const spansOf = (text: string, marker: string): string[] => {
  const spans: string[] = [];
  let at = text.indexOf(marker);
  while (at >= 0) {
    const end = text.indexOf(HIGHLIGHT_END, at);
    spans.push(text.slice(at + 1, end));
    at = text.indexOf(marker, end);
  }
  return spans;
};

const candidatesOf = (line: ReceiptLine): readonly string[] => receiptLineCandidates(line);

describe('markup to control bytes', () => {
  it('writes 0x81 / 0x82 to open and 0x80 to close in the US encoding, between runs encoded on their own', () => {
    const text = `You got ${primary('Bow')} from ${secondary('Zelda')}!`;
    const [bytes] = compressMarkedStrings([text], 'us');
    const [you, bow, from, zelda, bang] = compressStrings(['You got ', 'Bow', ' from ', 'Zelda', '!'], 'us');
    expect([...bytes]).toEqual([...you, 0x81, ...bow, 0x80, ...from, 0x82, ...zelda, 0x80, ...bang]);
  });

  it('writes 0x87 then 0x50 + span in the European encoding', () => {
    const [bytes] = compressMarkedStrings([`${primary('Bogen')}!`], 'de');
    const [bogen, bang] = compressStrings(['Bogen', '!'], 'de');
    expect([...bytes]).toEqual([0x87, 0x51, ...bogen, 0x87, 0x50, ...bang]);
  });

  it('leaves a line with no markup exactly as the plain encoder makes it', () => {
    const plain = 'The water has nothing left to give.';
    expect([...compressMarkedStrings([plain], 'us')[0]]).toEqual([...compressStrings([plain], 'us')[0]]);
  });
});

describe('widths ignore the markup', () => {
  it('keeps the markup through the character filter and wraps a marked line as it wraps the plain one', () => {
    const text = `${primary('Small Key of Eastern Palace')} (2 of 4), out of ${secondary('Eastern Palace - Big Chest')}.`;
    const marked = toDialogueText(text, US_CHARSET);
    expect(stripHighlight(marked)).toBe(toDialogueText(stripHighlight(text), US_CHARSET));
    expect(wrapRows(marked, US.alphabet, WIDTHS).map(stripHighlight))
      .toEqual(wrapRows(stripHighlight(marked), US.alphabet, WIDTHS));
  });

  it('closes a span at a row break and opens it again on the next row', () => {
    const rows = wrapRows(`${primary('aaaa bbbb cccc dddd eeee ffff gggg hhhh')} done`, US.alphabet, WIDTHS);
    expect(rows.length).toBeGreaterThan(1);
    for (const row of rows.slice(0, -1)) expect(row.endsWith(HIGHLIGHT_END)).toBe(true);
    expect(required(rows[1], 'second row').startsWith(HIGHLIGHT_PRIMARY)).toBe(true);
    expect(wrapMessageText(rows.join(' '), US.alphabet, WIDTHS)).toContain(`[2]${HIGHLIGHT_PRIMARY}`);
  });

  it('keeps a range on one row: no row ends on a value with the next one starting at the arrow', () => {
    const splitsRange = (rows: readonly string[]): boolean => rows.some((row, index) =>
      index + 1 < rows.length && /\S$/u.test(stripHighlight(row)) && stripHighlight(required(rows[index + 1], 'next row')).startsWith('>'));
    const pages = [
      ...candidatesOf(renderCapacityStep('wallet', 0, 1, 100)),
      ...candidatesOf(renderCapacityStep('projectiles', 1, 3, 8)),
      ...candidatesOf(renderCapacityStep('meter', 1, 2, 3)),
    ];
    for (let pad = 1; pad < 40; pad += 1) {
      for (const page of pages) {
        const text = `${'x'.repeat(pad)} ${page}`;
        const rows = wrapRows(text, US.alphabet, WIDTHS);
        expect(splitsRange(rows)).toBe(false);
        expect(rows.map(stripHighlight).join(' ')).toBe(stripHighlight(text));
      }
    }
    expect(wrapRows('Your wallet stretches 1 tier. 0 > 99 rupees', US.alphabet, WIDTHS).map(stripHighlight))
      .toContainEqual(expect.stringContaining('0 > 99'));
  });
});

describe('every composer marks the item and the player', () => {
  it('found, delivered and uncounted receipts mark the item name and leave the numbers plain', () => {
    const counted = renderReceiptMessage({ kind: 'physical', itemName: 'Bow', locationName: "Link's House", count: { ordinal: 1, total: 2 } });
    const uncounted = renderReceiptMessage({ kind: 'physical', itemName: 'Lamp', locationName: 'Sanctuary' });
    const delivered = renderReceiptMessage({ kind: 'delivered', itemName: 'Hookshot', locationName: 'Swamp Palace' });
    for (const text of candidatesOf(counted)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Bow']);
    for (const text of candidatesOf(uncounted)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Lamp']);
    for (const text of candidatesOf(delivered)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Hookshot']);
  });

  it('the progressive, junk and incoming lines mark the item, the incoming one its sender too', () => {
    expect(spansOf(renderProgressive('Sword'), HIGHLIGHT_PRIMARY)).toEqual(['sword']);
    expect(spansOf(renderJunk('Nothing'), HIGHLIGHT_PRIMARY)).toEqual(['Nothing']);
    const incoming = renderOnline('Zelda', 'Moon Pearl');
    expect(spansOf(incoming, HIGHLIGHT_PRIMARY)).toEqual(['Moon Pearl']);
    expect(spansOf(incoming, HIGHLIGHT_SECONDARY)).toEqual(['Zelda']);
  });

  it('the server line marks the item only, with no player to mark', () => {
    const text = renderFromServer('Moon Pearl');
    expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Moon Pearl']);
    expect(spansOf(text, HIGHLIGHT_SECONDARY)).toEqual([]);
    expect(stripHighlight(text)).toBe(`The server sent you Moon Pearl${BANG}`);
  });

  it('a capacity page takes the verb that agrees with its family label', () => {
    const read = (line: ReceiptLine): string => stripHighlight(required(candidatesOf(line)[0], 'first candidate'));
    expect(read(renderCapacityStep('projectiles', 1, 3, 8))).toMatch(/^Your arrows fill out 2 tiers\./);
    expect(read(renderCapacityStep('explosives', 1, 2, 8))).toMatch(/^Your bomb bag swells 1 tier\./);
    expect(read(renderCapacityStep('meter', 1, 2, 3))).toMatch(/^Your magic meter deepens 1 tier\./);
    expect(read(renderCapacityStep('wallet', 0, 1, 100))).toMatch(/^Your wallet stretches 1 tier\./);
  });
});

describe('every composer marks the item and the player', () => {
  it('a foreign line marks the item and the player it went to in every candidate', () => {
    const line = foreignItemLine({ owner: 'Zelda_', item: 'Progressive Scale' });
    const candidates = candidatesOf(line);
    for (const text of candidates) expect(spansOf(text, HIGHLIGHT_SECONDARY)).toEqual(['Zelda_']);
    for (const text of candidates.slice(0, -1)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toHaveLength(1);
    expect(spansOf(required(candidates[0], 'first candidate'), HIGHLIGHT_PRIMARY)).toEqual(['Progressive Scale']);
    expect(foreignItemLine(undefined)).toBe(`Sent to another player${BANG}`);
  });

  it('a pond demand marks what she asks for in every line, capitalised past the marker', () => {
    const item = pondDemandLinesOf({ currency: 'item', itemName: 'Progressive Sword' }, 'wish');
    const rupees = pondDemandLinesOf({ currency: 'rupees', amount: 150 }, 'more');
    for (const text of candidatesOf(item.ask)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Sword']);
    for (const text of candidatesOf(item.refuse)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Sword']);
    for (const text of candidatesOf(item.award ?? [])) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Sword']);
    for (const text of candidatesOf(rupees.ask)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['150 rupees']);
    expect(candidatesOf(item.refuse).at(-1)).toBe(`The ${primary('Sword')}, first.`);
  });

  it('capacity pages mark the family they grow, and the found line before them marks the item', () => {
    const lines = [
      ...candidatesOf(renderCapacityStep('explosives', 0, 1, 2)),
      ...candidatesOf(renderCapacityStep('wallet', 0, 2, 100)),
      ...candidatesOf(renderCapacityStep('meter', 1, 2, 3)),
    ];
    expect(lines.map((text) => spansOf(text, HIGHLIGHT_PRIMARY)[0]))
      .toEqual(['bomb bag', 'bomb bag', 'wallet', 'wallet', 'magic meter', 'magic meter']);
    const found = renderReceiptMessage({ kind: 'physical', itemName: 'Progressive Wallet', locationName: "Link's House" });
    for (const text of candidatesOf(found)) expect(spansOf(text, HIGHLIGHT_PRIMARY)).toEqual(['Progressive Wallet']);
  });

  it('the plain copy of a line reads with no markup left', () => {
    const text = renderOnline('Zelda', 'Moon Pearl');
    expect(stripHighlight(text)).toBe('Zelda turned up your Moon Pearl over in their world.');
    expect(stripHighlight(text)).not.toMatch(/[\u{E000}-\u{E002}]/u);
  });
});

describe('highlight colour defaults', () => {
  it('are the app gold and green, snapped to 15-bit words the core starts with', () => {
    expect(DEFAULT_SETTINGS.hudHighlightPrimary).toBe('#e8a33d');
    expect(DEFAULT_SETTINGS.hudHighlightSecondary).toBe('#7fb861');
    expect(hexToSnes15(DEFAULT_SETTINGS.hudHighlightPrimary)).toBe(0x1e9c);
    expect(hexToSnes15(DEFAULT_SETTINGS.hudHighlightSecondary)).toBe(0x32cf);
    const core = readFileSync(resolve(REPO_ROOT, 'core/game-hooks/dialog_highlight.c'), 'utf8');
    expect(core).toContain('g_colors[2] = {0x1e9c, 0x32cf}');
  });

  it('snaps each channel to the nearest of its 32 levels, red lowest', () => {
    expect(hexToSnes15('#ffffff')).toBe(0x7fff);
    expect(hexToSnes15('#000000')).toBe(0);
    expect(hexToSnes15('#ff0000')).toBe(0x001f);
    expect(hexToSnes15('#0000ff')).toBe(0x7c00);
  });
});
