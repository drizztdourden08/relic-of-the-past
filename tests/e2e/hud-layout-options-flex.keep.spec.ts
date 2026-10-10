/* @layer tests @kind test */
import { expect, test } from '@playwright/test';
import {
  FLEX_MANIP, FLOW, GRID_MANIP, LAYOUT, boxOf, built, inSection, photographPanelRails, placedAt, rigSlot, rulesFor,
} from './hud-layout-options';

const { currentRig, openRig, closeRig } = rigSlot();
const { click, flipped, pressAlign, stable } = rulesFor(currentRig);

const flipToFlex = async (): Promise<void> => {
  const rig = currentRig();
  await rig.pick('screen');
  await rig.shoot('07-grid-before-flip');
  const placedBefore = await rig.placed();
  const { before, after } = await stable(LAYOUT, async () => {
    await click(inSection(LAYOUT, '[data-engine="flex"]'));
  });
  flipped(before, after);
  expect(await rig.placed(), 'the engine flip did not re-place anything')
    .not.toEqual(placedBefore);
  await rig.shoot('07-flex-rest');
};

const flowTurnsTheStage = async (): Promise<void> => {
  const rig = currentRig();
  {
    const placedBefore = await rig.placed();
    const { before, after } = await stable(FLOW, async () => {
      await click(inSection(FLOW, '[aria-label^="column."]'));
    });
    flipped(before, after);
    const placedAfter = await rig.placed();
    expect(placedAt(placedAfter, 'buttons', 1), 'a column did not stack its children')
      .toBeGreaterThan(placedAt(placedBefore, 'buttons', 1));
    await rig.shoot('08-flex-column');
  }
  {
    const placedBefore = await rig.placed();
    const { before, after } = await stable(FLOW, async () => {
      await click(inSection(FLOW, '[aria-label^="row."]'));
    });
    flipped(before, after);
    expect(await rig.placed()).not.toEqual(placedBefore);
  }
  for (const _pass of [0, 1]) {
    const placedBefore = await rig.placed();
    const { before, after } = await stable(FLOW, async () => {
      await click(inSection(FLOW, '[data-action="wrap"]'));
    });
    flipped(before, after);
    expect(await rig.placed()).toEqual(placedBefore);
  }
};

const nineAlignmentTiles = async (): Promise<void> => {
  for (const key of ['justify:center', 'justify:end', 'justify:between', 'justify:around',
    'justify:evenly', 'justify:start']) {
    await pressAlign(key, 'justify');
  }
  for (const key of ['align:center', 'align:end', 'align:start']) {
    await pressAlign(key, 'align');
  }
  await currentRig().shoot('09-flex-alignment');
};

const gapAndOverlay = async (): Promise<void> => {
  const rig = currentRig();
  {
    const placedBefore = await rig.placed();
    const { before, after } = await stable(LAYOUT, async () => {
      await click(inSection(LAYOUT, '[aria-label="Increment gap x"]'));
      await click(inSection(LAYOUT, '[aria-label="Increment gap x"]'));
    });
    flipped(before, after);
    expect(placedAt(await rig.placed(), 'buttons', 0), 'a flex gap x did not widen the flow')
      .toBeGreaterThan(placedAt(placedBefore, 'buttons', 0));
    await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
    await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
  }
  {
    const { before, after } = await stable(LAYOUT, async () => {
      await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
    });
    flipped(before, after);
    const drawn = await rig.overlay();
    expect(drawn.slots, 'the flex overlay drew no slots').toBeGreaterThan(0);
    expect(drawn.lines).toBe(0);
    await rig.shoot('10-flex-overlay-on');
    await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
  }
};

const cell = inSection(FLEX_MANIP, '.hud-flex-strip__cell');
const labels = async (): Promise<string[]> =>
  currentRig().window.locator(`${cell} .hud-flex-strip__label`).allTextContents();

const pressWritesNothing = async (): Promise<void> => {
  const rig = currentRig();
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
};

const fourMovesReorder = async (): Promise<void> => {
  const rig = currentRig();
  {
    await click(cell);
    const order = await labels();
    const placedBefore = await rig.placed();
    await click(inSection(FLEX_MANIP, '[data-action="move-later"]'));
    const moved = await labels();
    expect(moved).toEqual([order[1], order[0], ...order.slice(2)]);
    expect(placedAt(await rig.placed(), order[0], 0), 'the stage did not follow the reorder')
      .not.toBe(placedAt(placedBefore, order[0], 0));
  }
  {
    const order = await labels();
    await click(`${cell}[data-index="1"]`);
    await click(inSection(FLEX_MANIP, '[data-action="move-earlier"]'));
    expect(await labels()).toEqual([order[1], order[0], ...order.slice(2)]);
  }
  {
    const order = await labels();
    await click(`${cell}[data-index="0"]`);
    await click(inSection(FLEX_MANIP, '[data-action="move-end"]'));
    expect(await labels()).toEqual([...order.slice(1), order[0]]);
    await click(inSection(FLEX_MANIP, '[data-action="move-start"]'));
    expect(await labels()).toEqual(order);
    await rig.shoot('12-flex-reordered');
  }
  {
    const before = await rig.shape(FLEX_MANIP);
    await click(`${cell}[data-index="1"]`);
    const after = await rig.shape(FLEX_MANIP);
    expect(after.controls.filter((c) => c.tag === 'div').length)
      .toBe(before.controls.filter((c) => c.tag === 'div').length);
  }
};

const flipBackToGrid = async (): Promise<void> => {
  const rig = currentRig();
  const placedBefore = await rig.placed();
  const { before, after } = await stable(LAYOUT, async () => {
    await click(inSection(LAYOUT, '[data-engine="grid"]'));
  });
  flipped(before, after);
  expect(await rig.placed()).not.toEqual(placedBefore);
  expect(await rig.window.locator(inSection(GRID_MANIP, '.hud-lattice__body')).count()).toBe(1);
  await rig.shoot('13-grid-again');
};

const formulaPromotion = async (): Promise<void> => {
  const rig = currentRig();
  const field = inSection(LAYOUT, '[aria-label="gap x"]');
  const sibling = inSection(LAYOUT, '[aria-label="gap y"]');
  const sectionBefore = await rig.shape(LAYOUT);
  const siblingBefore = await boxOf(rig, sibling);
  const selfBefore = await boxOf(rig, field);

  await rig.window.locator(field).first().click();
  await rig.window.locator(field).first().fill('= 4 + 4');
  await rig.window.waitForTimeout(400);

  expect(await boxOf(rig, sibling), 'the sibling moved when a formula was promoted')
    .toEqual(siblingBefore);
  expect((await boxOf(rig, field)).width, 'the promoted field did not widen')
    .toBeGreaterThan(selfBefore.width);
  expect((await rig.shape(LAYOUT)).box, 'the section changed height while typing')
    .toEqual(sectionBefore.box);
  await rig.shoot('14-gap-formula-promoted');

  await rig.window.keyboard.press('Escape');
  await rig.window.locator(inSection(LAYOUT, '[data-engine="grid"]')).first().click();
  await rig.window.waitForTimeout(400);
  expect(await boxOf(rig, sibling)).toEqual(siblingBefore);
};

test.describe('every option a FLEX container has, pressed one by one', () => {
  test.skip(!built(), 'run npx electron-vite build first');
  test.describe.configure({ mode: 'serial', timeout: 900_000 });

  test.beforeAll(openRig);
  test.afterAll(closeRig);

  test('TYPE: flipping the engine changes the LIT BUTTON and nothing else here', flipToFlex);
  test('a FLEX container: FLOW is its own section, and it turns the stage', flowTurnsTheStage);
  test('a FLEX container: all nine alignment tiles write one key and move children', nineAlignmentTiles);
  test('a FLEX container: gap and overlay behave exactly as they do under a grid', gapAndOverlay);
  test('FLEX MANIPULATION: a press writes nothing, and the four moves reorder', async () => {
    await pressWritesNothing();
    await fourMovesReorder();
  });
  test('TYPE: flipping back to a grid restores the lattice and re-places', flipBackToGrid);
  test('PROMOTION: typing a formula in a gap field moves nothing beside it', formulaPromotion);
  test('the panel was photographed at 232 and at 320, under both engines', async () => {
    await photographPanelRails(currentRig(), click);
  });
});
