/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PauseNamePanel } from '@app/hud';
import type { ItemNamePanelProps, SlotName } from '../ItemsTab.type';

const statusOf = (t: I18n['t'], name: SlotName, hovering: boolean): string => {
  if (!hovering) return t('views-cheats:status.hover');
  if (!name.owned) return t('views-cheats:status.notOwned');
  return t('views-cheats:status.owned');
};

const ItemNamePanel = ({ name, hovering, scale, spritesBase }: ItemNamePanelProps) => {
  const t = useT();
  return (
    <Box className="cheats-items__name" data-owned={name.owned ? '' : undefined}>
      <PauseNamePanel
        itemName={name.lines}
        itemSprite={name.sprite}
        borderColor="green"
        scale={scale}
        spritesBase={spritesBase}
      />
      <Text className="cheats-items__status">{statusOf(t, name, hovering)}</Text>
    </Box>
  );
};

export { ItemNamePanel };
