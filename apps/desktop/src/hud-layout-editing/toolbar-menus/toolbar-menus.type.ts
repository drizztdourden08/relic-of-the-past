/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { MenuNode } from '@drizztdourden08/tessera/composites';
import type { HudNode } from '@rotp/hud';
import type { Translate } from '../translate.type';
import type { Translate } from '../translate.type';

interface MenuDeps {
  insert: (node: HudNode) => void;
  t: Translate;
}

interface ToolbarGroup {
  key: string;
  icon: IconifyIcon;
  label: string;
  items: MenuNode[];
}

export type { MenuDeps, ToolbarGroup };
