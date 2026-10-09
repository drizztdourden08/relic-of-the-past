/* @layer renderer-components @kind logic */
import starIcon from '@iconify-icons/lucide/star';
import bookmarkIcon from '@iconify-icons/lucide/bookmark';
import type { MenuEntry } from '@drizztdourden08/tessera/composites';
import type { HudLayout } from '@shared/types/hud';

const presetItems = (layouts: readonly HudLayout[], draftId: string, onStartFrom: (layout: HudLayout) => void): MenuEntry[] =>
  layouts.map((layout) => ({
    key: layout.id,
    icon: layout.builtIn ? starIcon : bookmarkIcon,
    label: layout.name,
    checked: layout.id === draftId,
    onClick: () => onStartFrom(layout),
  }));

export { presetItems };
