/* @layer renderer-widgets @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { getSpritesBase } from '@rotp/game-data';
import { useConsoleScale } from '../../behavior/useConsoleScale';
import { PointerHintProvider } from '../../sub-components/PointerHintProvider';
import { useInPlay } from '../../behavior/useInPlay';
import { IN_PLAY_REASON } from '../../CheatsWidget.constants';
import type { CheatTabProps } from '../../CheatsWidget.type';
import { buildSlotSpecs, specBySlot } from './behavior/slot-specs';
import { useSlotName } from './behavior/useSlotName';
import { useSlotWrite } from './behavior/useSlotWrite';
import { ItemNamePanel } from './sub-components/ItemNamePanel';
import { ItemGridEditor } from './sub-components/ItemGridEditor';
import { EquipmentEditor } from './sub-components/EquipmentEditor';
import { ProgressEditor } from './sub-components/ProgressEditor';
import { AbilitiesEditor } from './sub-components/AbilitiesEditor';
import { TierList } from './sub-components/TierList';
import { ITEMS_TILES_WIDE } from './ItemsTab.constants';
import type { OpenSlot } from './ItemsTab.type';
import './ItemsTab.css';

const ItemsTab = ({ gates }: CheatTabProps) => {
  const { ref, scale } = useConsoleScale(ITEMS_TILES_WIDE);
  const spritesBase = getSpritesBase();
  const specs = useMemo(() => specBySlot(buildSlotSpecs()), []);
  const inPlay = useInPlay();
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState<OpenSlot | null>(null);
  const write = useSlotWrite();
  const nameOf = useSlotName(specs);

  const name = nameOf(hovered);
  const close = useCallback(() => setOpen(null), []);

  return (
    <DisabledOverlay
      active={!gates.allowed.items || !inPlay}
      message={gates.allowed.items ? IN_PLAY_REASON : gates.reason('items')}
      contained
    >
      <Box ref={ref} className="cheats-items">
      <PointerHintProvider>
        <ItemNamePanel name={name} hovering={hovered !== null} scale={scale} spritesBase={spritesBase} />
        <ItemGridEditor
          specs={specs}
          hovered={hovered}
          scale={scale}
          spritesBase={spritesBase}
          onHover={setHovered}
          onOpen={setOpen}
          write={write}
        />
        <Box className="cheats-items__row">
          <EquipmentEditor specs={specs} scale={scale} spritesBase={spritesBase} onHover={setHovered} onOpen={setOpen} />
          <ProgressEditor scale={scale} spritesBase={spritesBase} />
        </Box>
        <AbilitiesEditor
          specs={specs}
          scale={scale}
          spritesBase={spritesBase}
          onHover={setHovered}
          onOpen={setOpen}
          write={write}
        />
        <Text as="p" className="cheats-hint">
          Ghosted: not owned, click gives it. Owned: click opens its tiers, with Remove.
        </Text>
        {open && <TierList open={open} spritesBase={spritesBase} write={write} onClose={close} />}
      </PointerHintProvider>
      </Box>
    </DisabledOverlay>
  );
};

export { ItemsTab };
