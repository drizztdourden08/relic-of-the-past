/* @layer tests @kind test */
import { expect, test } from '@playwright/test';
import {
  COL_HEAD, GRID_MANIP, LAYOUT, ROW_HEAD, built, inSection, open, rulesFor,
} from './hud-layout-options';
import type { Rig } from './hud-layout-options';

let rig: Rig;
const { click, flipped, pressAlign, sizeTrack, stable, stageState } = rulesFor(() => rig);

test.describe('every option a GRID container has, pressed one by one', () => {
  test.skip(!built(), 'run npx electron-vite build first');
  test.describe.configure({ mode: 'serial', timeout: 900_000 });

  test.beforeAll(async () => { rig = await open(); });
  test.afterAll(async () => { await rig?.close(); });

  test('a GRID: section one holds its shape while gap, overlay and guide write', async () => {
    await rig.pick('screen');
    await rig.shoot('01-grid-rest');

    {
      expect((await rig.overlay()).lines).toBe(0);
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
      });
      flipped(before, after);
      expect((await rig.overlay()).lines, 'the overlay drew nothing').toBeGreaterThan(0);
      await rig.shoot('02-grid-overlay-on');
    }

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

    {
      const was = await rig.overlay();
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
        await click(inSection(LAYOUT, '[aria-label="Decrement gap x"]'));
      });
      flipped(before, after);
      expect((await rig.overlay()).xs).not.toEqual(was.xs);
    }

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

    {
      const { before, after } = await stable(LAYOUT, async () => {
        await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));
      });
      flipped(before, after);
      expect((await rig.overlay()).lines).toBe(0);
    }
  });

  test('a GRID: each of the eight alignment tiles writes one key and moves items', async () => {
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

    await click(inSection(LAYOUT, '[data-action="grid-overlay"]'));

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

    {
      const stage = await stageState();
      await click(inSection(GRID_MANIP, COL_HEAD));
      expect(await stageState(), 'selecting a track wrote to the document').toBe(stage);
      expect(await rig.window.locator(inSection(GRID_MANIP, '.hud-grid__bar-chip')).count())
        .toBe(1);
      await rig.shoot('05-grid-column-picked');
    }

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
      const percentOfZeroMovesNothing = mode === '%';
      if (!percentOfZeroMovesNothing) {
        expect(`size ${mode} changed the solve: ${(await stageState()) !== stage}`)
          .toBe(`size ${mode} changed the solve: true`);
      }
    }

    for (const action of ['insert-before', 'insert-after', 'move-later']) {
      const was = await rig.lattice();
      await click(inSection(GRID_MANIP, `[data-action="${action}"]`));
      const now = await rig.lattice();
      expect(`${action} rewrote the lattice: ${JSON.stringify(now) !== JSON.stringify(was)}`)
        .toBe(`${action} rewrote the lattice: true`);
    }
    await rig.shoot('06-grid-track-sized');

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
