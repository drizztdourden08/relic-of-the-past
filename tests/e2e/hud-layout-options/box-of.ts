/* @layer tests @kind helper */
import type { Rig } from './hud-layout-options.type';

const boxOf = async (rig: Rig, selector: string): Promise<{ x: number; y: number; width: number }> => {
  const box = await rig.window.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width) };
};

export { boxOf };
