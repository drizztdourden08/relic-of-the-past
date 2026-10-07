/* @layer renderer-components @kind component */
/**
 * The Glyph insert, picked by eye: tabs are the packs, tiles are the actual
 * artwork. Replaces the old pack-then-position nested menu, which asked a
 * player to recognise a control by its SDL name (`LEFT_SHOULDER`) instead of
 * its picture.
 *
 * Each tile resolves through the same fallback chain the live HUD draws with
 * (pack → its declared fallback → generic), so a position this pack does not
 * own its own art for still shows the picture it would actually get instead
 * of a blank square. A position nothing anywhere draws is left out of
 * the grid, because there is nothing to look at.
 */
import { useMemo, useState } from 'react';
import { Portal, usePickerPopover } from '@ds/primitives/Portal';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { TabBar } from '@ds/primitives/TabBar';
import { Thumbnail } from '@ds/primitives/Thumbnail';
import { AUTO_PACK_ID, GENERIC_PACK_ID, findGlyphPack } from '@shared/input/glyphs';
import { GLYPH_POSITIONS } from '../behavior/toolbar-menus';
import { glyphSourceFor, glyphUrlOf } from '../behavior/glyph-art';
import type { RefObject } from 'react';
import type { GlyphPack, HudGlyphPosition } from '@shared/types/hud';

interface GlyphPickerGridProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  packs: readonly GlyphPack[];
  onClose: () => void;
  onPick: (params: { position: HudGlyphPosition; pack?: string }) => void;
}

const GlyphPickerGrid = (props: GlyphPickerGridProps) => {
  const { open, anchorRef, packs, onClose, onPick } = props;
  const [packId, setPackId] = useState(AUTO_PACK_ID);
  const { position, panelRef } = usePickerPopover({ open, anchorRef, onClose, estimatedWidth: 280, estimatedHeight: 300 });

  const generic = useMemo(() => findGlyphPack(GENERIC_PACK_ID, packs), [packs]);
  const activePack = packId === AUTO_PACK_ID ? null : findGlyphPack(packId, packs);

  const tiles = useMemo(() => GLYPH_POSITIONS
    .map((pos) => ({ position: pos as HudGlyphPosition, source: glyphSourceFor(activePack, generic, pos as HudGlyphPosition) }))
    .filter((tile) => tile.source !== null), [activePack, generic]);

  if (!open) return null;

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="hud-picker-grid"
        data-drop-up={position?.dropUp ? 'true' : undefined}
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        <Box className="hud-picker-grid__tabs">
          <TabBar
            tabs={[{ id: AUTO_PACK_ID, label: 'Auto' }, ...packs.map((pack) => ({ id: pack.id, label: pack.name }))]}
            activeTab={packId}
            onTabChange={setPackId}
          />
        </Box>
        <Box className="hud-picker-grid__tiles">
          {tiles.map((tile) => (
            <Button
              variant="bare"
              key={tile.position}
              className="hud-picker-grid__tile"
              title={tile.position}
              onClick={() => {
                onPick({ position: tile.position, ...(packId === AUTO_PACK_ID ? {} : { pack: packId }) });
                onClose();
              }}
            >
              <Thumbnail src={glyphUrlOf(tile.source)} alt={tile.position} className="hud-picker-grid__thumb hud-picker-grid__thumb--glyph" />
              <Text className="hud-picker-grid__label">{tile.position}</Text>
            </Button>
          ))}
        </Box>
      </Box>
    </Portal>
  );
};

export { GlyphPickerGrid };
export type { GlyphPickerGridProps };
