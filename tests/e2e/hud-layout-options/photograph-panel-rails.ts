/* @layer tests @kind helper */
import { LAYOUT, SHOTS } from './hud-layout-options.constants';
import type { Rig } from './hud-layout-options.type';
import { inSection } from './in-section';

const WIDE_RAIL = 320;
const NARROW_RAIL = 232;

const dragRailTo = async (rig: Rig, rail: number): Promise<void> => {
  const handle = rig.window.locator('[aria-label="Resize inspector panel"]');
  const box = await handle.boundingBox();
  if (!box) return;
  await rig.window.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await rig.window.mouse.down();
  await rig.window.mouse.move(box.x + box.width / 2 + (WIDE_RAIL - rail), box.y + box.height / 2, { steps: 8 });
  await rig.window.mouse.up();
  await rig.window.waitForTimeout(400);
};

const photographPanelRails = async (rig: Rig, click: (selector: string) => Promise<void>): Promise<void> => {
  for (const rail of [WIDE_RAIL, NARROW_RAIL]) {
    if (rail !== WIDE_RAIL) await dragRailTo(rig, rail);
    await rig.pick('screen');
    await rig.window.locator('.hud-inspect').screenshot({ path: `${SHOTS}/panel-grid-${rail}.png` });
    await click(inSection(LAYOUT, '[data-engine="flex"]'));
    await rig.window.locator('.hud-inspect').screenshot({ path: `${SHOTS}/panel-flex-${rail}.png` });
    await click(inSection(LAYOUT, '[data-engine="grid"]'));
  }
};

export { photographPanelRails };
