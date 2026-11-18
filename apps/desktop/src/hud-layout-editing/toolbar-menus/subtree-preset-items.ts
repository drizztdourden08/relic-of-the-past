/* @layer renderer-components @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { HUD_PRESETS, instantiatePreset } from '@rotp/hud';
import { menuIcon } from './menu-icon';
import type { MenuNode } from '@drizztdourden08/tessera/composites';
import type { MenuDeps } from './toolbar-menus.type';

const subtreePresetItems = (deps: MenuDeps, text: (text: Text) => string): MenuNode[] =>
  HUD_PRESETS.map((preset) => ({
    id: preset.id,
    icon: menuIcon(preset.icon),
    label: text(preset.name),
    onSelect: () => {
      const node = instantiatePreset(preset.id);
      if (node) deps.insert(node);
    },
  }));

export { subtreePresetItems };
