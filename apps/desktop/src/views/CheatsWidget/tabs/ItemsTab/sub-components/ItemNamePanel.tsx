/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PauseNamePanel } from '@app/hud';
import type { ItemNamePanelProps, SlotName } from '../ItemsTab.type';

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
