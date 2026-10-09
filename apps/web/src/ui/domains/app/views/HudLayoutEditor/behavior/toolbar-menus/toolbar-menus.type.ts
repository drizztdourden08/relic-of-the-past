/* @layer renderer-components @kind types */
import type { MenuEntry, MenuIconSource } from '@drizztdourden08/tessera/composites';
import type { HudNode } from '@shared/types/hud';

interface MenuDeps {
  insert: (node: HudNode) => void;
}

interface ToolbarGroup {
  key: string;
  icon: MenuIconSource;
  label: string;
  items: MenuEntry[];
}

export type { MenuDeps, ToolbarGroup };
