/* @layer renderer-widgets @kind component */
/**
 * The Items tab: the pause menu's five panels, made clickable. The name box follows the slot
 * under the pointer; the ITEM grid, EQUIP, PENDANTS / CRYSTALS and A boxes each edit what they
 * draw. One tier list is open at a time, under the cell that opened it.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, Text } from '@ds/primitives';
import { DisabledOverlay } from '@ds/composites/DisabledOverlay';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { useConsoleScale } from '../../behavior/useConsoleScale';
import type { CheatGates } from '../../behavior/useCheatGates';
import { PointerHintProvider } from '../../sub-components/PointerHintProvider';
import { IN_PLAY_REASON, useInPlay } from '../../behavior/useInPlay';
import { buildSlotSpecs, specBySlot } from './behavior/slot-specs';
import { useSlotName } from './behavior/useSlotName';
import { useSlotWrite } from './behavior/useSlotWrite';
import { ItemNamePanel } from './sub-components/ItemNamePanel';
import { ItemGridEditor } from './sub-components/ItemGridEditor';
import { EquipmentEditor } from './sub-components/EquipmentEditor';
import { ProgressEditor } from './sub-components/ProgressEditor';
import { AbilitiesEditor } from './sub-components/AbilitiesEditor';
import { TierList } from './sub-components/TierList';
import type { OpenSlot } from './ItemsTab.type';
import './ItemsTab.css';

type ItemsTabProps = {
  gates: CheatGates;
};

/** The ITEM box is 19 tiles wide with its border; two more keep it clear of the edge. */
const TILES_WIDE = 21;

const ItemsTab = ({ gates }: ItemsTabProps) => {
  const { ref, scale } = useConsoleScale(TILES_WIDE);
  const spritesBase = getSpritesBase();
  const specs = useMemo(() => specBySlot(buildSlotSpecs()), []);
  const inPlay = useInPlay();
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState<OpenSlot | null>(null);
  const write = useSlotWrite();
  const nameOf = useSlotName(specs);

  // The name box follows the pointer only; with nothing under it, it waits.
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
export type { ItemsTabProps };
