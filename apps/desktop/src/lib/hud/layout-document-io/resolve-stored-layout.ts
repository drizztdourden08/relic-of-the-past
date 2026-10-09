/* @layer renderer-lib @kind logic */
import { DEFAULT_LAYOUT, layoutById } from '@shared/hud/layouts';
import type { HudLayout } from '@shared/types/hud';
import { readCustomLayouts } from './read-custom-layouts';

const resolveStoredLayout = async (id: string): Promise<HudLayout> => {
  const builtIn = layoutById(id);
  if (builtIn) return builtIn;
  const { documents } = await readCustomLayouts();
  return documents.find((doc) => doc.id === id) ?? DEFAULT_LAYOUT;
};

export { resolveStoredLayout };
