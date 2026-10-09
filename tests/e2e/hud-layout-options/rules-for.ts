/* @layer tests @kind helper */
import { expect } from '@playwright/test';
import { ALIGN, CLICK_SETTLE_MS, GRID_MANIP } from './hud-layout-options.constants';
import type { Rig, Shape } from './hud-layout-options.type';
import { inSection } from './in-section';
import { tile } from './tile';

const rulesFor = (currentRig: () => Rig) => {
  const click = async (selector: string): Promise<void> => {
    await currentRig().window.locator(selector).first().click();
    await currentRig().window.waitForTimeout(CLICK_SETTLE_MS);
  };

  const stable = async (section: string, act: () => Promise<void>): Promise<{
    before: Shape; after: Shape;
  }> => {
    const before = await currentRig().shape(section);
    await act();
    const after = await currentRig().shape(section);
    expect(after.controls, `${section}: a control appeared, vanished or moved`)
      .toEqual(before.controls);
    expect(after.box, `${section}: the section's own box changed`).toEqual(before.box);
    return { before, after };
  };

  const flipped = (before: Shape, after: Shape): void => {
    expect(after.state, 'the option did not change its own state').not.toEqual(before.state);
  };

  const stageState = async (): Promise<string> => {
    const [placed, overlay] = await Promise.all([currentRig().placed(), currentRig().overlay()]);
    return JSON.stringify({ placed, xs: overlay.xs, ys: overlay.ys });
  };

  const sizeTrack = async (head: string, mode: string): Promise<void> => {
    await click(inSection(GRID_MANIP, head));
    await click(inSection(GRID_MANIP, '[data-action="size"]'));
    await currentRig().window.locator('.dropdown__item', { hasText: mode === '%' ? '% (' : `${mode} (` })
      .first().click();
    await currentRig().window.waitForTimeout(CLICK_SETTLE_MS);
  };

  const pressAlign = async (key: string, row: string): Promise<void> => {
    const placedBefore = await currentRig().placed();
    const { before, after } = await stable(ALIGN, async () => {
      await click(inSection(ALIGN, tile(key)));
    });
    const placedAfter = await currentRig().placed();
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

export { rulesFor };
