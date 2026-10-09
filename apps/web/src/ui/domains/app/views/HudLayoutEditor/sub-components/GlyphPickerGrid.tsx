/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Portal, usePickerPopover, Box, Button, Text, Tabs, Thumbnail } from '@drizztdourden08/tessera/primitives';
import { AUTO_PACK_ID, GENERIC_PACK_ID, findGlyphPack } from '@shared/input/glyphs';
import { GLYPH_POSITIONS } from '../behavior/toolbar-menus';
import { glyphSourceFor, glyphUrlOf } from '../behavior/glyph-art';
import type { HudGlyphPosition } from '@shared/types/hud';
import type { GlyphPickerGridProps } from './GlyphPickerGrid.type';

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
          <Tabs
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
export type { GlyphPickerGridProps } from './GlyphPickerGrid.type';
