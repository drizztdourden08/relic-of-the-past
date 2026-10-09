/* @layer renderer-lib @kind logic */
import { newId } from '@shared/storage/id';
import type { HudLayout } from '@shared/types/hud';

const forkLayout = (source: HudLayout, name: string): HudLayout => ({
  ...structuredClone(source),
  id: `custom-${newId()}`,
  name: name.trim() || `${source.name} copy`,
  builtIn: false,
  basedOn: source.basedOn ?? source.id,
});

export { forkLayout };
