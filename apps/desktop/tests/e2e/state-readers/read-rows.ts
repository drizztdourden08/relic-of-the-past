/* @layer tests @kind helper */
import type { Page } from 'playwright';
import { STATE_WORDS } from './state-readers.constants';
import type { AnnotationRow } from './state-readers.type';

const parseRow = (title: string, spans: string[]): AnnotationRow => {
  const kind = /^(\S+) at /.exec(title)?.[1] ?? 'unknown';
  const cells = spans.map((s) => s.trim());
  const [glyph = '', label = '', ...rest] = cells;
  const tail = rest.at(-1);
  const state = tail && STATE_WORDS.has(tail) ? tail : undefined;
  const detail = (state ? rest.slice(0, -1) : rest).filter((c) => c.length > 0).join(' ');
  return { kind, glyph, label, ...(detail ? { detail } : {}), ...(state ? { state } : {}) };
};

const readRows = async (window: Page): Promise<AnnotationRow[]> => {
  const rows = window.locator('div[title*=". Click to "]');
  const count = await rows.count();
  const out: AnnotationRow[] = [];
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const title = (await row.getAttribute('title')) ?? '';
    out.push(parseRow(title, await row.locator('xpath=./span').allTextContents()));
  }
  return out;
};

export { readRows };
