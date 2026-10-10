/* @layer renderer-components @kind component */
import { useMemo, useRef, useState } from 'react';
import { Anchored, Box, Image, Pressable, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { usePickerDismiss } from '@app/compounds/SpritePicker';
import { AUTO_PACK_ID, GENERIC_PACK_ID, findGlyphPack } from '@rotp/input-mapping';
import { GLYPH_POSITIONS } from '@app/hud-layout-editing/toolbar-menus';
import { glyphSourceFor, glyphUrlOf } from '@app/hud-layout-editing/glyph-art';
import type { HudGlyphPosition } from '@rotp/hud';
import type { GlyphPickerGridProps } from './GlyphPickerGrid.type';

const GlyphPickerGrid = (props: GlyphPickerGridProps) => {
  const { open, anchorRef, packs, onClose, onPick } = props;
  const [packId, setPackId] = useState(AUTO_PACK_ID);
  const panelRef = useRef<HTMLDivElement>(null);
  usePickerDismiss({ open, anchorRef, panelRef, onClose });

  const generic = useMemo(() => findGlyphPack(GENERIC_PACK_ID, packs), [packs]);
  const activePack = packId === AUTO_PACK_ID ? null : findGlyphPack(packId, packs);

  const tiles = useMemo(() => GLYPH_POSITIONS
    .map((pos) => ({ position: pos as HudGlyphPosition, source: glyphSourceFor(activePack, generic, pos as HudGlyphPosition) }))
    .filter((tile) => tile.source !== null), [activePack, generic]);

  if (!open) return null;

  return (
    <Anchored ref={panelRef} anchorRef={anchorRef} placement="bottom-start" layer="popover" className="hud-picker-grid">
      <Box className="hud-picker-grid__tabs">
        <Tabs
          tabs={[{ id: AUTO_PACK_ID, label: 'Auto' }, ...packs.map((pack) => ({ id: pack.id, label: pack.name }))]}
          activeTab={packId}
          onTabChange={setPackId}
        />
      </Box>
      <Box className="hud-picker-grid__tiles">
        {tiles.map((tile) => (
          <Pressable
            key={tile.position}
            className="hud-picker-grid__tile"
            title={tile.position}
            onClick={() => {
              onPick({ position: tile.position, ...(packId === AUTO_PACK_ID ? {} : { pack: packId }) });
              onClose();
            }}
          >
            <Image frame src={glyphUrlOf(tile.source)} alt={tile.position} className="hud-picker-grid__thumb" />
            <Text className="hud-picker-grid__label">{tile.position}</Text>
          </Pressable>
        ))}
      </Box>
    </Anchored>
  );
};

export { GlyphPickerGrid };
export type { GlyphPickerGridProps } from './GlyphPickerGrid.type';
