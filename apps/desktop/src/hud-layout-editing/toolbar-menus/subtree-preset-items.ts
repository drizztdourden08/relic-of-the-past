/* @layer renderer-components @kind logic */
import { HUD_PRESETS, instantiatePreset } from '@rotp/hud';
import { menuIcon } from './menu-icon';
import type { MenuNode } from '@drizztdourden08/tessera/composites';
import type { MenuDeps } from './toolbar-menus.type';

const subtreePresetItems = (deps: MenuDeps): MenuNode[] =>
  HUD_PRESETS.map((preset) => ({
    id: preset.id,
    icon: menuIcon(preset.icon),
    label: preset.name,
    onSelect: () => {
      const node = instantiatePreset(preset.id);
      if (node) deps.insert(node);
    },
  }));

export { subtreePresetItems };
