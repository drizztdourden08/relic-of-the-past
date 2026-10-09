/* @layer renderer-components @kind logic */
import { HUD_PRESETS, instantiatePreset } from '@shared/hud/presets';
import type { MenuEntry } from '@ds/composites/DropdownMenu';
import type { MenuDeps } from './toolbar-menus.type';

const subtreePresetItems = (deps: MenuDeps): MenuEntry[] =>
  HUD_PRESETS.map((preset) => ({
    key: preset.id,
    icon: preset.icon,
    label: preset.name,
    onClick: () => {
      const node = instantiatePreset(preset.id);
      if (node) deps.insert(node);
    },
  }));

export { subtreePresetItems };
