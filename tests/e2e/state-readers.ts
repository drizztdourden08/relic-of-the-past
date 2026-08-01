/* @layer tests @kind test */
/**
 * Reading the navigation widget as data.
 *
 * The widget renders inline-styled divs and spans, so there is nothing to query
 * by role or class — each fact needs its own anchor. Anchoring on the section
 * TITLE text ("States", "On this screen") rather than on styling means a restyle
 * cannot break these specs, only a rename can, and a rename is a real change.
 *
 * Every poll here asserts a predicate rather than sleeping a fixed time: the
 * emulator boots at whatever speed the machine allows, so a slow machine must
 * wait longer, not fail.
 *
 * ORDERING MATTERS. The flood is what derives the annotations, so `readGroups`,
 * `readRows`, `readTags` and `readCheckSummary` all report nothing until
 * `readFlood` has run. Call the flood first; reading annotations before it reads
 * as "the mechanic is missing", which looks exactly like the regression these
 * specs exist to catch.
 */
import type { Page } from 'playwright';

/** Ceiling for any poll — generous, machine-dependent. */
const POLL_TIMEOUT_MS = 60_000;
const POLL_STEP_MS = 500;

/** The words the panel puts in an annotation row's trailing state slot. */
const STATE_WORDS = new Set(['open', 'shut', 'done', 'available', 'unreachable']);

interface AnnotationRow {
  /** Annotation kind, taken from the row's own tooltip (`chest at r54 c56 — …`). */
  kind: string;
  glyph: string;
  label: string;
  detail?: string;
  state?: string;
}

interface CheckSummary {
  done: number;
  available: number;
  blocked: number;
}

/** Direct-child spans of the row div under the section titled `title`. */
const sectionChips = (window: Page, title: string) =>
  window.locator(`xpath=//div[normalize-space(text())="${title}"]/../div/span`);

/** Chip texts from the "States" row. Empty when the widget says "none active". */
const readStates = async (window: Page): Promise<string[]> => {
  const chips = await sectionChips(window, 'States').allTextContents();
  return chips.map((c) => c.trim()).filter((c) => c.length > 0 && c !== 'none active');
};

/** Poll the chips until one matches, so a slow beat waits instead of failing. */
const awaitState = async (window: Page, match: RegExp, timeoutMs = POLL_TIMEOUT_MS): Promise<string> => {
  const deadline = Date.now() + timeoutMs;
  let last: string[] = [];
  for (;;) {
    last = await readStates(window);
    const hit = last.find((s) => match.test(s));
    if (hit) return hit;
    if (Date.now() >= deadline) break;
    await window.waitForTimeout(POLL_STEP_MS);
  }
  throw new Error(`no state chip matched ${match} within ${timeoutMs}ms; chips were ${JSON.stringify(last)}`);
};

/** Run the flood and read the widget's own reachable/total once it stops moving. */
const readFlood = async (window: Page): Promise<{ reachable: number; total: number }> => {
  await window.getByTestId('nav-flood-btn').click();
  const label = window.locator('text=/^\\d+\\/\\d+ \\(\\d+%\\)$/').first();
  await label.waitFor({ state: 'visible', timeout: POLL_TIMEOUT_MS });
  // A multi-screen area sums per sub-screen, so the total climbs for a moment.
  let text = '';
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const next = (await label.textContent())?.trim() ?? '';
    if (next && next === text) break;
    text = next;
    await window.waitForTimeout(POLL_STEP_MS);
  }
  const m = /^(\d+)\/(\d+) \(\d+%\)$/.exec(text);
  if (!m) throw new Error(`unreadable flood label: ${JSON.stringify(text)}`);
  return { reachable: Number(m[1]), total: Number(m[2]) };
};

/** "On this screen" group headers → item count, e.g. `{ Checks: 2, 'Ways out': 3 }`. */
const readGroups = async (window: Page): Promise<Record<string, number>> => {
  const found = await window
    .locator('text=/^(Checks|Locks & barriers|Triggers|Ways out|Unmapped) \\(\\d+\\)$/')
    .allTextContents();
  const out: Record<string, number> = {};
  for (const raw of found) {
    const m = /^(.+) \((\d+)\)$/.exec(raw.trim());
    if (m) out[m[1]] = Number(m[2]);
  }
  return out;
};

const parseRow = (title: string, spans: string[]): AnnotationRow => {
  const kind = /^(\S+) at /.exec(title)?.[1] ?? 'unknown';
  const cells = spans.map((s) => s.trim());
  const [glyph = '', label = '', ...rest] = cells;
  const tail = rest.at(-1);
  const state = tail && STATE_WORDS.has(tail) ? tail : undefined;
  const detail = (state ? rest.slice(0, -1) : rest).filter((c) => c.length > 0).join(' ');
  return { kind, glyph, label, ...(detail ? { detail } : {}), ...(state ? { state } : {}) };
};

/**
 * Every annotation row under "On this screen". The rows are the only elements
 * carrying the "click to hide/show" tooltip, which makes it the reliable anchor.
 */
const readRows = async (window: Page): Promise<AnnotationRow[]> => {
  const rows = window.locator('div[title*=" — click to "]');
  const count = await rows.count();
  const out: AnnotationRow[] = [];
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const title = (await row.getAttribute('title')) ?? '';
    out.push(parseRow(title, await row.locator('xpath=./span').allTextContents()));
  }
  return out;
};

/** Decoded room-tag chips — the tooltip carries the raw tag byte. */
const readTags = async (window: Page): Promise<string[]> =>
  (await window.locator('span[title^="tag 0x"]').allTextContents()).map((t) => t.trim());

/** The done / available / unreachable tallies above the groups. */
const readCheckSummary = async (window: Page): Promise<CheckSummary> => {
  const one = async (word: string): Promise<number> => {
    const hits = await window.locator(`text=/^\\d+ ${word}$/`).allTextContents();
    return Number(/^(\d+)/.exec(hits[0]?.trim() ?? '')?.[1] ?? 0);
  };
  return { done: await one('done'), available: await one('available'), blocked: await one('unreachable') };
};

/** The `screen-133 · 0x80 · INDOOR` / `screen-062 · 0x1B · LW · R3 C3` id line. */
const readScreenId = async (window: Page): Promise<string> =>
  ((await window.locator('text=/screen-[0-9]{3} · /').first().textContent()) ?? '').trim();

export {
  readStates, awaitState, readFlood, readGroups, readRows, readTags, readCheckSummary, readScreenId,
  POLL_TIMEOUT_MS, POLL_STEP_MS, STATE_WORDS,
};
export type { AnnotationRow, CheckSummary };
