/* @layer renderer-widgets @kind component */
/**
 * The pause menu's name box, fed by the slot under the pointer, with a short status beside it.
 * An unowned slot still names itself, drawn dimmed, so a ghost reads before it is clicked.
 */
import { Box, Text } from '@ds/primitives';
import { PauseNamePanel } from '@domains/hud';
import type { SlotName } from '../ItemsTab.type';

type ItemNamePanelProps = {
  name: SlotName;
  /** Whether a slot is under the pointer; otherwise the panel shows the equipped item. */
  hovering: boolean;
  scale: number;
  spritesBase: string;
};

const statusOf = (name: SlotName, hovering: boolean): string => {
  if (!hovering) return 'Hover a slot';
  if (!name.owned) return 'Not owned. Click gives it.';
  return 'Owned. Click opens its tiers.';
};

const ItemNamePanel = ({ name, hovering, scale, spritesBase }: ItemNamePanelProps) => (
  <Box className="cheats-items__name" data-owned={name.owned ? '' : undefined}>
    <PauseNamePanel
      itemName={name.lines}
      itemSprite={name.sprite}
      borderColor="green"
      scale={scale}
      spritesBase={spritesBase}
    />
    <Text className="cheats-items__status">{statusOf(name, hovering)}</Text>
  </Box>
);

export { ItemNamePanel };
export type { ItemNamePanelProps };
