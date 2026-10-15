/* @layer tests @kind helper */
import type { Page } from 'playwright';

const STYLE_ROW = '[data-setting-key="hudStyle"]';
const STYLE_SEGMENTS = `${STYLE_ROW} .segmented__btn`;

const styleSegments = (page: Page) => page.$$eval(STYLE_SEGMENTS, (els) => els.map((el) => ({
  label: el.textContent.trim(),
  disabled: (el as HTMLButtonElement).disabled,
  checked: el.getAttribute('aria-checked') === 'true',
})));

const assignedSlots = (page: Page) => page.$$eval('.slot-row', (rows) => rows
  .map((row) => ({
    what: (row.querySelector('.binding-row__snes-label')?.textContent ?? '').trim(),
    on: (row.querySelector('.binding-row__binding-label')?.textContent ?? '').trim(),
  }))
  .filter((slot) => slot.what !== 'Unassigned')
  .map((slot) => `${slot.what} on ${slot.on}`));

const labelsWhere = (page: Page, selector: string, attribute: string) =>
  page.$$eval(selector, (els, attr) => els
    .filter((el) => el.getAttribute(attr) === 'true')
    .map((el) => el.textContent.trim()), attribute);

export { STYLE_ROW, STYLE_SEGMENTS, assignedSlots, labelsWhere, styleSegments };
