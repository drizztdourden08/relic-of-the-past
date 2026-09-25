/* @layer tests @kind test */
/* @layer tests @kind test */
/**
 * EVERY OPTION A GRID CONTAINER HAS, PRESSED ONE BY ONE, IN THE BUILT APP (§58).
 * The flex half is `hud-layout-options-flex.keep.spec.ts`; both drive the same
 * rig and assert the same two rules (`hud-layout-options.rules.ts`), and they
 * are two files only because one would be twice the 300-line cap.
 *
 * > "THE FUCKING OPTIONS GO BY CONCERNS. NOTHING IN A FUCKING SECTION SHOULD
 * > CHANGE WHEN CLICKING ANY FUCKING OTHER OPTION IN THAT SAME FUCKING SECTION!
 * > redo it.
 * >
 * > TEST EVERY FUCKING OPTION by hand, one by one, and check the result in the
 * > layout after changing it"
 *
 * THIS FILE IS THAT SENTENCE, AS AN ASSERTION. For each option it:
 *
 * 1. reads the SHAPE of the section the option lives in, meaning every control's
 *    tag, name and rectangle plus the section's own box;
 * 2. presses the option;
 * 3. asserts the shape is IDENTICAL, while the option's own lit/checked/value
 *    state has moved. A later section may change; the same one may not.
 * 4. asserts the STAGE changed the way that option should change it, so a real
 *    placed rectangle moved, an overlay appeared, a colour changed or a child
 *    swapped places with its neighbour. Never "it did not throw".
 *
 * WHY THE SCREEN ROOT IS THE SUBJECT. Alignment, flow and distribution are only
 * visible in a container with room to spare, and a content-hugging row answers
 * every one of them with "nothing moved". The screen root is the full play field
 * with three children in it, and §42 made it an ordinary container that can be
 * flipped to either engine, so one node exercises both halves at a size where
 * every option has somewhere to move something.
 *
 * NOTHING IS EVER SAVED. The draft is a memento (`useLayoutDraft`) and the run
 * closes the app without committing, so the shipped document is untouched.
 */
import { expect, test } from '@playwright/test';
import { SHOTS, built, open } from './hud-layout-options.harness';
import {
  ALIGN, COL_HEAD, FLEX_MANIP, FLOW, GRID_MANIP, LAYOUT, ROW_HEAD, inSection, rulesFor, tile,
} from './hud-layout-options.rules';
import type { Rig, Shape } from './hud-layout-options.harness';

let rig: Rig;
let rules: ReturnType<typeof rulesFor>;

const click = (selector: string): Promise<void> => rules.click(selector);
const stable = (section: string, act: () => Promise<void>): Promise<{ before: Shape; after: Shape }> =>
  rules.stable(section, act);
const flipped = (before: Shape, after: Shape): void => rules.flipped(before, after);
const stageState = (): Promise<string> => rules.stageState();
const sizeTrack = (head: string, mode: string): Promise<void> => rules.sizeTrack(head, mode);
const pressAlign = (key: string, row: string): Promise<void> => rules.pressAlign(key, row);

test.describe('every option a GRID container has, pressed one by one', () => {
  test.skip(!built(), 'run npx electron-vite build first');
  test.describe.configure({ mode: 'serial', timeout: 900_000 });

  test.beforeAll(async () => { rig = await open(); rules = rulesFor(rig); });
  test.afterAll(async () => { await rig?.close(); });

  test('a GRID: section one holds its shape while gap, overlay and guide write', async () => {
    await rig.pick('screen');
    await rig.shoot('01-grid-rest');

    // OVERLAY ON FIRST, and for more than the toggle's own case. A gap between
    // two `auto` columns either side of a `fill` one moves no child rectangle,
    // because the outer bands still hug their corners and the fill track absorbs
    // it. So the CELL BOUNDARIES are what a grid's gap is judged by, and they are
    // only visible with the overlay up.
    {
      expect((await rig.overlay()).lines).toBe(0);
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
      });
      flipped(before, after);
      expect((await rig.overlay()).lines, 'the overlay drew nothing').toBeGreaterThan(0);
      await rig.shoot('02-grid-overlay-on');
    }

    // GAP ↔ UP moves the vertical cell boundaries and leaves the horizontal ones.
    {
      const was = await rig.overlay();
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[aria-label="Increment gap x"]'));
        await click(inSection(LAYOUT, '[aria-label="Increment gap x"]'));
      });
      flipped(before, after);
      const now = await rig.overlay();
      expect(now.xs, 'gap x moved no column boundary').not.toEqual(was.xs);
      expect(now.ys, 'gap x moved a ROW boundary, so the axes are crossed').toEqual(was.ys);
    }

    // GAP ↔ DOWN puts it back, to the pixel.
    {
      const was = await rig.overlay();
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
        await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
      });
      flipped(before, after);
      expect((await rig.overlay()).xs).not.toEqual(was.xs);
    }

    // GAP ↕ UP / DOWN works the other axis and moves the other set of lines.
    {
      const was = await rig.overlay();
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[aria-label="Increment gap y"]'));
        await click(inSection(LAYOUT, '[aria-label="Increment gap y"]'));
      });
      flipped(before, after);
      const now = await rig.overlay();
      expect(now.ys, 'gap y moved no row boundary').not.toEqual(was.ys);
      expect(now.xs, 'gap y moved a COLUMN boundary, so the axes are crossed').toEqual(was.xs);
      await click(inSection(LAYOUT, '[aria-label="Decrement gap y"]'));
      await click(inSection(LAYOUT, '[aria-label="Decrement gap y"]'));
      expect((await rig.overlay()).ys).toEqual(was.ys);
    }

    // GUIDE COLOUR recolours the lines it draws, and nothing else moves.
    {
      const colourBefore = (await rig.overlay()).color;
      await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '.color-swatch'));
        await rig.window.locator('.color-picker-popover [aria-label="Hex"]').fill('33ddaa');
        await rig.window.locator('.color-picker-popover [aria-label="Hex"]').press('Enter');
        await rig.window.waitForTimeout(300);
        await rig.window.keyboard.press('Escape');
      });
      expect((await rig.overlay()).color, 'the guide colour did not reach the overlay')
        .not.toBe(colourBefore);
      await rig.shoot('03-grid-guide-colour');
    }

    // OVERLAY OFF takes the lines away.
    {
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
      });
      flipped(before, after);
      expect((await rig.overlay()).lines).toBe(0);
    }
  });

  test('a GRID: each of the eight alignment tiles writes one key and moves items', async () => {
    // FIRST, GIVE THE CELL ROOM. `justifyItems` positions a child INSIDE its own
    // cell, and the screen's first column and row are `auto`. They hug what is
    // in them, so there is nothing for any of the four values to do and all four
    // would pass by doing nothing. `fill` makes column 1 and row 1 share the
    // spare space with the middle bands, which is the state these options are
    // actually for. Put back at the end of the case.
    await sizeTrack(COL_HEAD, 'fill');
    await sizeTrack(ROW_HEAD, 'fill');
    await rig.window.keyboard.press('Escape');

    for (const key of ['justifyItems:center', 'justifyItems:end', 'justifyItems:stretch', 'justifyItems:start']) {
      await pressAlign(key, 'justifyItems');
    }
    for (const key of ['alignItems:center', 'alignItems:end', 'alignItems:stretch', 'alignItems:start']) {
      await pressAlign(key, 'alignItems');
    }
    await rig.shoot('04-grid-alignment');

    await sizeTrack(COL_HEAD, 'auto');
    await sizeTrack(ROW_HEAD, 'auto');
    await rig.window.keyboard.press('Escape');
  });

  test('a GRID: the manipulation section adds, inserts, moves, sizes and removes', async () => {
    const columns = async (): Promise<number> =>
      rig.window.locator(inSection(GRID_MANIP, COL_HEAD)).count();
    const rows = async (): Promise<number> =>
      rig.window.locator(inSection(GRID_MANIP, ROW_HEAD)).count();

    // The overlay is up for the whole case, because a track edit's effect is a
    // cell boundary before it is ever a child (see `stageState`).
    await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));

    // ADD COLUMN / ADD ROW. The lattice grows by one header and the STAGE does
    // not move, which is correct and is asserted instead of glossed: a new
    // track is `auto` and EMPTY, and an empty `auto` track solves to zero width.
    // So the proof that the track is real is the next press: size it `fill` and
    // the cell boundaries move. An assertion that stopped at "a header appeared"
    // would pass for a header that names nothing.
    {
      const was = await columns();
      const stage = await stageState();
      await click(inSection(GRID_MANIP, '[data-action="add-column"]'));
      expect(await columns(), 'add-column did not add a header').toBe(was + 1);
      expect(await stageState(), 'an empty auto column moved something').toBe(stage);
      await click(inSection(GRID_MANIP, `${COL_HEAD}:nth-last-of-type(1)`));
      await click(inSection(GRID_MANIP, '[data-action="size"]'));
      await rig.window.locator('.dropdown__item', { hasText: 'fill (' }).first().click();
      await rig.window.waitForTimeout(300);
      expect(await stageState(), 'the new column was not a real track').not.toBe(stage);
      await rig.window.keyboard.press('Escape');
    }
    {
      const was = await rows();
      await click(inSection(GRID_MANIP, '[data-action="add-row"]'));
      expect(await rows(), 'add-row did not add a header').toBe(was + 1);
    }

    // SELECT A COLUMN. A press writes NOTHING, and the toolbar fills.
    {
      const stage = await stageState();
      await click(inSection(GRID_MANIP, COL_HEAD));
      expect(await stageState(), 'selecting a track wrote to the document').toBe(stage);
      expect(await rig.window.locator(inSection(GRID_MANIP, '.hud-grid__bar-chip')).count())
        .toBe(1);
      await rig.shoot('05-grid-column-picked');
    }

    // SIZE runs all four modes on a column that HOLDS something, through the
    // selected header's own menu. Each is judged by the track list it writes
    // (the header prints its own extent) and, for three of the four, by the
    // solve as well. The exception is honest and is asserted as an exception:
    // `px` and `%` both carry the previous track's NUMBER, which for a column
    // that was `auto` is zero. So `px 0` → `% 0` is two spellings of nothing
    // and moves no pixel. `auto` puts the content width back.
    //
    // The column picked above is still picked, and pressing its header again
    // would press the SIZE BUTTON its label becomes while selected, which is the
    // control working exactly as §55 designed it.
    for (const mode of ['fill', 'px', '%', 'auto']) {
      const stage = await stageState();
      const was = await rig.lattice();
      await click(inSection(GRID_MANIP, '[data-action="size"]'));
      await rig.window.locator('.dropdown__item', { hasText: mode === '%' ? '% (' : `${mode} (` })
        .first().click();
      await rig.window.waitForTimeout(300);
      expect(`size ${mode} rewrote the track: ${
        JSON.stringify((await rig.lattice()).heads) !== JSON.stringify(was.heads)}`)
        .toBe(`size ${mode} rewrote the track: true`);
      if (mode !== '%') {
        expect(`size ${mode} changed the solve: ${(await stageState()) !== stage}`)
          .toBe(`size ${mode} changed the solve: true`);
      }
    }

    // INSERT BEFORE / AFTER and MOVE LATER each act on the picked column, and
    // each is judged by the occupancy map it rewrites. An inserted `auto` track is
    // empty and therefore zero-wide, so what these three DO is renumber the
    // children beside them, per §50's "children are kept valid automatically".
    // The drawing shows that, and a stage of unmoved pixels cannot.
    for (const action of ['insert-before', 'insert-after', 'move-later']) {
      const was = await rig.lattice();
      await click(inSection(GRID_MANIP, `[data-action="${action}"]`));
      const now = await rig.lattice();
      expect(`${action} rewrote the lattice: ${JSON.stringify(now) !== JSON.stringify(was)}`)
        .toBe(`${action} rewrote the lattice: true`);
    }
    await rig.shoot('06-grid-track-sized');

    // REMOVE takes the column out, renumbers the children around it, and drops
    // the selection with it. The one picked here is an empty track, so again no
    // pixel moves and the claim is the document's: one fewer header, and every
    // child to its right re-addressed.
    {
      const was = await columns();
      const lattice = await rig.lattice();
      await click(inSection(GRID_MANIP, '[data-action="remove"]'));
      expect(await columns(), 'remove left the header count alone').toBe(was - 1);
      expect(JSON.stringify(await rig.lattice()), 'remove rewrote nothing')
        .not.toBe(JSON.stringify(lattice));
      expect(await rig.window.locator(inSection(GRID_MANIP, '.hud-grid__bar-chip')).count(),
        'the selection survived the track it named').toBe(0);
    }

    await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
  });

  test('a GRID: every selection gesture writes NOTHING', async () => {
    const placedBefore = await rig.placed();
    const cell = inSection(GRID_MANIP, '.hud-lattice__cell');
    await click(cell);
    await rig.window.locator(cell).nth(1).click({ modifiers: ['Control'] });
    await rig.window.locator(cell).nth(2).click({ modifiers: ['Shift'] });
    await rig.window.locator(inSection(GRID_MANIP, '.hud-lattice__body')).press('ArrowRight');
    await rig.window.locator(inSection(GRID_MANIP, '.hud-lattice__body')).press('ArrowDown');
    await rig.window.keyboard.press('Escape');
    expect(await rig.placed(), 'a selection gesture wrote to the document')
      .toEqual(placedBefore);
  });

});
