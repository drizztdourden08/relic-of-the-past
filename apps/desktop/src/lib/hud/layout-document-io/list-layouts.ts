/* @layer renderer-lib @kind logic */
import { BUILT_IN_LAYOUTS } from '@shared/hud/layouts';
import type { HudLayout } from '@shared/types/hud';
import { readCustomLayouts } from './read-custom-layouts';

const listLayouts = async (): Promise<HudLayout[]> => [
  ...BUILT_IN_LAYOUTS,
  ...(await readCustomLayouts()).documents,
];

export { listLayouts };
