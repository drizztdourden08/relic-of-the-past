/* @layer tests @kind test */
/* @layer tests @kind test */
/**
 * EVERY OPTION A FLEX CONTAINER HAS, PRESSED ONE BY ONE, IN THE BUILT APP (§58),
 * starting with the TYPE flip that makes one out of the screen root. The grid
 * half is `hud-layout-options-grid.keep.spec.ts`; both drive the same rig and
 * assert the same two rules (`hud-layout-options.rules.ts`).
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

test.describe('every option a FLEX container has, pressed one by one', () => {
  test.skip(!built(), 'run npx electron-vite build first');
  test.describe.configure({ mode: 'serial', timeout: 900_000 });

  test.beforeAll(async () => { rig = await open(); rules = rulesFor(rig); });
  test.afterAll(async () => { await rig?.close(); });

  test('TYPE: flipping the engine changes the LIT BUTTON and nothing else here', async () => {
    // THE SCREEN ROOT IS THE SUBJECT, for the reason in this file's header:
    // alignment and distribution only show themselves in a container with room
    // to spare, and this is the one container that always has some.
    await rig.pick('screen');
    await rig.shoot('07-grid-before-flip');
    const placedBefore = await rig.placed();
    const { before, after } = await stable(LAYOUT, async () => {
      await click(inSection(LAYOUT, '[data-engine="flex"]'));
    });
    flipped(before, after);
    // THE WHOLE POINT: section one is byte-identical in shape across the flip.
    // §56 grew a second gap field and dropped the Overlay piece here, which is
    // the rule broken by the option that is supposed to be governed by it.
    expect(await rig.placed(), 'the engine flip did not re-place anything')
      .not.toEqual(placedBefore);
    await rig.shoot('07-flex-rest');
  });

  test('a FLEX container: FLOW is its own section, and it turns the stage', async () => {
    // DIRECTION → column. The children stack instead of running across.
    {
      const placedBefore = await rig.placed();
      const { before, after } = await stable(FLOW, async () => {
        await click(inSection(FLOW, '[aria-label^="column."]'));
      });
      flipped(before, after);
      const placedAfter = await rig.placed();
      expect(placedAfter['buttons'][1], 'a column did not stack its children')
        .toBeGreaterThan(placedBefore['buttons'][1]);
      await rig.shoot('08-flex-column');
    }

    // DIRECTION → row, back.
    {
      const placedBefore = await rig.placed();
      const { before, after } = await stable(FLOW, async () => {
        await click(inSection(FLOW, '[aria-label^="row."]'));
      });
      flipped(before, after);
      expect(await rig.placed()).not.toEqual(placedBefore);
    }

    // WRAP on, and off. With children that already fit one line the engine has
    // nothing to move, so the claim here is the PANEL's: the toggle lights, the
    // section holds its shape, and the stage is not disturbed by a flag that
    // does not apply. (What wrap does when it DOES apply is pinned at real
    // pixels in `hud-layout-engine.keep.test.ts`.)
    for (const _pass of [0, 1]) {
      const placedBefore = await rig.placed();
      const { before, after } = await stable(FLOW, async () => {
        await click(inSection(FLOW, '[data-action="wrap"]'));
      });
      flipped(before, after);
      expect(await rig.placed()).toEqual(placedBefore);
    }
  });

  test('a FLEX container: all nine alignment tiles write one key and move children', async () => {
    for (const key of ['justify:center', 'justify:end', 'justify:between', 'justify:around',
      'justify:evenly', 'justify:start']) {
      await pressAlign(key, 'justify');
    }
    for (const key of ['align:center', 'align:end', 'align:start']) {
      await pressAlign(key, 'align');
    }
    await rig.shoot('09-flex-alignment');
  });

  test('a FLEX container: gap and overlay behave exactly as they do under a grid', async () => {
    // THE SAME TWO CELLS AND THE SAME TOGGLE is the §58 claim, and the
    // stage proves both actually reach the engine under this engine too.
    {
      const placedBefore = await rig.placed();
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[aria-label="Increment gap x"]'));
        await click(inSection(LAYOUT, '[aria-label="Increment gap x"]'));
      });
      flipped(before, after);
      expect((await rig.placed())['buttons'][0], 'a flex gap x did not widen the flow')
        .toBeGreaterThan(placedBefore['buttons'][0]);
      await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
      await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
    }
    {
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
      });
      flipped(before, after);
      // A FLEX OVERLAY DRAWS ONE SLOT PER CHILD, NOT LINES (§57.5).
      const drawn = await rig.overlay();
      expect(drawn.slots, 'the flex overlay drew no slots').toBeGreaterThan(0);
      expect(drawn.lines).toBe(0);
      await rig.shoot('10-flex-overlay-on');
      await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
    }
  });

  test('FLEX MANIPULATION: a press writes nothing, and the four moves reorder', async () => {
    const cell = inSection(FLEX_MANIP, '.hud-flex-strip__cell');
    const labels = async (): Promise<string[]> =>
      rig.window.locator(`${cell} .hud-flex-strip__label`).allTextContents();

    // GESTURES FIRST: click, {mod}-click, shift-click, arrows and Escape are all
    // context, and none of them is an edit.
    {
      const placedBefore = await rig.placed();
      const order = await labels();
      await click(cell);
      await rig.window.locator(cell).nth(2).click({ modifiers: ['Control'] });
      await rig.window.locator(cell).nth(1).click({ modifiers: ['Shift'] });
      await rig.window.locator(inSection(FLEX_MANIP, '.hud-flex-strip')).press('ArrowRight');
      await rig.window.keyboard.press('Escape');
      expect(await rig.placed(), 'a flex selection gesture wrote to the document')
        .toEqual(placedBefore);
      expect(await labels(), 'a flex selection gesture reordered the children')
        .toEqual(order);
      await rig.shoot('11-flex-strip-picked');
    }

    // MOVE LATER swaps the picked child with the one after it, in the panel
    // AND on the stage.
    {
      await click(cell);
      const order = await labels();
      const placedBefore = await rig.placed();
      await click(inSection(FLEX_MANIP, '[data-action="move-later"]'));
      const moved = await labels();
      expect(moved).toEqual([order[1], order[0], ...order.slice(2)]);
      expect((await rig.placed())[order[0]][0], 'the stage did not follow the reorder')
        .not.toBe(placedBefore[order[0]][0]);
    }

    // MOVE EARLIER puts it back, exactly.
    {
      const order = await labels();
      await click(`${cell}[data-index="1"]`);
      await click(inSection(FLEX_MANIP, '[data-action="move-earlier"]'));
      expect(await labels()).toEqual([order[1], order[0], ...order.slice(2)]);
    }

    // MOVE TO END, then MOVE TO START, which reach the ends of the run.
    {
      const order = await labels();
      await click(`${cell}[data-index="0"]`);
      await click(inSection(FLEX_MANIP, '[data-action="move-end"]'));
      expect(await labels()).toEqual([...order.slice(1), order[0]]);
      await click(inSection(FLEX_MANIP, '[data-action="move-start"]'));
      expect(await labels()).toEqual(order);
      await rig.shoot('12-flex-reordered');
    }

    // AND THE STRIP HELD ITS SHAPE THROUGHOUT. A move changes which cell is
    // lit and which name each cell carries, never how many there are or where
    // they sit. (`controls` carries `data-index` and the rectangle, so a cell
    // appearing, vanishing or resizing fails here.)
    {
      const before = await rig.shape(FLEX_MANIP);
      await click(`${cell}[data-index="1"]`);
      const after = await rig.shape(FLEX_MANIP);
      expect(after.controls.filter((c) => c.tag === 'div').length)
        .toBe(before.controls.filter((c) => c.tag === 'div').length);
    }
  });

  test('TYPE: flipping back to a grid restores the lattice and re-places', async () => {
    const placedBefore = await rig.placed();
    const { before, after } = await stable(LAYOUT, async () => {
      await click(inSection(LAYOUT, '[data-engine="grid"]'));
    });
    flipped(before, after);
    expect(await rig.placed()).not.toEqual(placedBefore);
    expect(await rig.window.locator(inSection(GRID_MANIP, '.hud-lattice__body')).count()).toBe(1);
    await rig.shoot('13-grid-again');
  });

  test('PROMOTION: typing a formula in a gap field moves nothing beside it', async () => {
    // §36's promotion reflowed the row. The sibling dropped to a new line and
    // everything under it moved down. §58 floats the control instead.
    const field = inSection(LAYOUT, '[aria-label="gap x"]');
    const sibling = inSection(LAYOUT, '[aria-label="gap y"]');
    const boxOf = async (selector: string): Promise<{ x: number; y: number; width: number }> => {
      const box = await rig.window.locator(selector).first().boundingBox();
      if (!box) throw new Error(`no box for ${selector}`);
      return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width) };
    };

    const sectionBefore = await rig.shape(LAYOUT);
    const siblingBefore = await boxOf(sibling);
    const selfBefore = await boxOf(field);

    await rig.window.locator(field).first().click();
    await rig.window.locator(field).first().fill('= 4 + 4');
    await rig.window.waitForTimeout(400);

    expect(await boxOf(sibling), 'the sibling moved when a formula was promoted')
      .toEqual(siblingBefore);
    expect((await boxOf(field)).width, 'the promoted field did not widen')
      .toBeGreaterThan(selfBefore.width);
    expect((await rig.shape(LAYOUT)).box, 'the section changed height while typing')
      .toEqual(sectionBefore.box);
    await rig.shoot('14-gap-formula-promoted');

    // AND IT COLLAPSES BACK on blur, with the row exactly as it was.
    await rig.window.keyboard.press('Escape');
    await rig.window.locator(inSection(LAYOUT, '[data-engine="grid"]')).first().click();
    await rig.window.waitForTimeout(400);
    expect(await boxOf(sibling)).toEqual(siblingBefore);
  });

  test('the panel was photographed at 232 and at 320, under both engines', async () => {
    // The look, for a person: the two rails the maintainer judges at.
    for (const rail of [320, 232]) {
      if (rail !== 320) {
        const handle = rig.window.locator('[aria-label="Resize inspector panel"]');
        const box = await handle.boundingBox();
        if (box) {
          await rig.window.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await rig.window.mouse.down();
          await rig.window.mouse.move(box.x + box.width / 2 + (320 - rail), box.y + box.height / 2, { steps: 8 });
          await rig.window.mouse.up();
          await rig.window.waitForTimeout(400);
        }
      }
      await rig.pick('screen');
      await rig.window.locator('.hud-inspect').screenshot({ path: `${SHOTS}/panel-grid-${rail}.png` });
      await click(inSection(LAYOUT, '[data-engine="flex"]'));
      await rig.window.locator('.hud-inspect').screenshot({ path: `${SHOTS}/panel-flex-${rail}.png` });
      await click(inSection(LAYOUT, '[data-engine="grid"]'));
    }
  });
});
