/* @layer tests @kind helper */
/**
 * THE RULE, AS TWO FUNCTIONS (§58). The grid half of the option sweep and the
 * flex half both use it, and they are two spec files only because one would be
 * twice the 300-line cap.
 *
 * `stable` is the maintainer's sentence:
 *
 * > "NOTHING IN A FUCKING SECTION SHOULD CHANGE WHEN CLICKING ANY FUCKING OTHER
 * > OPTION IN THAT SAME FUCKING SECTION!"
 *
 * Press an option and the section it lives in must come back with the same
 * controls, the same rectangles and the same overall box. `flipped` is the other
 * half, and it is what stops the first from passing vacuously: the option's OWN
 * lit/checked/value state has to have moved, or nothing was pressed.
 */
import { expect } from '@playwright/test';
import type { Rig, Shape } from './hud-layout-options.harness';

const LAYOUT = 'Container';
const FLOW = 'Flow';
const ALIGN = 'Alignment';
const GRID_MANIP = 'Grid manipulation';
const FLEX_MANIP = 'Flex manipulation';

const COL_HEAD = '.hud-lattice__head:not(.hud-lattice__head--row)';
const ROW_HEAD = '.hud-lattice__head--row';

/** A section's own controls, addressed inside it, because two sections can hold
 *  a button with the same name (both manipulation strips do). */
const inSection = (title: string, selector: string): string =>
  `.hud-subsec[aria-label="${title}"] ${selector}`;

const tile = (key: string): string => `[data-align="${key}"]`;

const rulesFor = (rig: Rig) => {
  const click = async (selector: string): Promise<void> => {
    await rig.window.locator(selector).first().click();
    await rig.window.waitForTimeout(300);
  };

  /** Press `act`, and the section it was pressed in must come back the same
   *  shape with only its own state moved. */
  const stable = async (section: string, act: () => Promise<void>): Promise<{
    before: Shape; after: Shape;
  }> => {
    const before = await rig.shape(section);
    await act();
    const after = await rig.shape(section);
    expect(after.controls, `${section}: a control appeared, vanished or moved`)
      .toEqual(before.controls);
    expect(after.box, `${section}: the section's own box changed`).toEqual(before.box);
    return { before, after };
  };

  /** And the option's own state DID move, or the case is vacuous. */
  const flipped = (before: Shape, after: Shape): void => {
    expect(after.state, 'the option did not change its own state').not.toEqual(before.state);
  };

  /**
   * EVERYTHING THE STAGE IS SHOWING, as one string: where every node landed AND
   * where the overlay's cell boundaries are.
   *
   * THE SECOND HALF IS NOT PADDING. A grid whose outer bands are `auto` and
   * whose middle is `fill` answers "add a column", "insert a column" and "widen
   * the gap" by resizing the FILL TRACK. Every child stays exactly where it
   * was, because that is what those tracks are for. The cells still move, they
   * come out of the engine's own solve (`stageCellRects`), and the overlay is
   * where a person sees them. Judging a track edit by child rectangles alone
   * would pass it for doing nothing.
   */
  const stageState = async (): Promise<string> => {
    const [placed, overlay] = await Promise.all([rig.placed(), rig.overlay()]);
    return JSON.stringify({ placed, xs: overlay.xs, ys: overlay.ys });
  };

  /** Pick a track and set its size through its own header's menu. */
  const sizeTrack = async (head: string, mode: string): Promise<void> => {
    await click(inSection(GRID_MANIP, head));
    await click(inSection(GRID_MANIP, '[data-action="size"]'));
    await rig.window.locator('.dropdown__item', { hasText: mode === '%' ? '% (' : `${mode} (` })
      .first().click();
    await rig.window.waitForTimeout(300);
  };

  /**
   * ONE ALIGNMENT TILE, PRESSED AND JUDGED. Three claims in one place, because a
   * tile has three things it must do and two it must not: the section keeps its
   * shape, the pressed tile is the only lit one on its row, and the children
   * really moved.
   *
   * PRESSING THE TILE THAT IS ALREADY LIT IS A NO-OP, and that is asserted
   * instead of skipped: it writes the value it already had, so nothing may move.
   */
  const pressAlign = async (key: string, row: string): Promise<void> => {
    const placedBefore = await rig.placed();
    const { before, after } = await stable(ALIGN, async () => {
      await click(inSection(ALIGN, tile(key)));
    });
    const placedAfter = await rig.placed();
    const wasLit = before.state.includes(`${key}=true`);
    expect(after.state, `${key} is not the lit tile`).toContain(`${key}=true`);
    expect(after.state.filter((s) => s.startsWith(`${row}:`) && s.endsWith('=true')).length,
      `${row} lit more than one tile`).toBe(1);
    if (wasLit) {
      expect(placedAfter, `${key} was already set and still moved something`).toEqual(placedBefore);
      return;
    }
    flipped(before, after);
    expect(`${key} re-placed the children: ${
      JSON.stringify(placedAfter) !== JSON.stringify(placedBefore)}`)
      .toBe(`${key} re-placed the children: true`);
  };

  return { click, flipped, pressAlign, sizeTrack, stable, stageState };
};

export {
  ALIGN, COL_HEAD, FLEX_MANIP, FLOW, GRID_MANIP, LAYOUT, ROW_HEAD, inSection, rulesFor, tile,
};
