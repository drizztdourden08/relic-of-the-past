/* @layer renderer-components @kind logic */
import starIcon from '@iconify-icons/lucide/star';
import bookmarkIcon from '@iconify-icons/lucide/bookmark';
import { menuIcon } from './menu-icon';
import type { MenuNode } from '@drizztdourden08/tessera/composites';
import type { HudLayout } from '@rotp/hud';

const presetItems = (layouts: readonly HudLayout[], draftId: string, onStartFrom: (layout: HudLayout) => void): MenuNode[] =>
  layouts.map((layout) => ({
    id: layout.id,
    icon: menuIcon(layout.builtIn ? starIcon : bookmarkIcon),
    label: layout.name,
    checked: layout.id === draftId,
    onSelect: () => onStartFrom(layout),
  }));

export { presetItems };
