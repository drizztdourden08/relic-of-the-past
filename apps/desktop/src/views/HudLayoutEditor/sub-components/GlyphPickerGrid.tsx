/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Anchored, Box, Image, Pressable, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { AUTO_PACK_ID, GENERIC_PACK_ID, findGlyphPack } from '@rotp/input-mapping';
import { GLYPH_POSITIONS } from '@app/hud-layout-editing/toolbar-menus';
import { glyphSourceFor, glyphUrlOf } from '@app/hud-layout-editing/glyph-art';
import type { HudGlyphPosition } from '@rotp/hud';
import type { GlyphPickerGridProps } from './GlyphPickerGrid.type';

const GlyphPickerGrid = (props: GlyphPickerGridProps) => {
  const { open, anchorRef, packs, onClose, onPick } = props;
  const [packId, setPackId] = useState(AUTO_PACK_ID);

  const generic = useMemo(() => findGlyphPack(GENERIC_PACK_ID, packs), [packs]);
  const activePack = packId === AUTO_PACK_ID ? null : findGlyphPack(packId, packs);

  const tiles = useMemo(() => GLYPH_POSITIONS
    .map((pos) => ({ position: pos as HudGlyphPosition, source: glyphSourceFor(activePack, generic, pos as HudGlyphPosition) }))
    .filter((tile) => tile.source !== null), [activePack, generic]);

  if (!open) return null;

  return (
    <Anchored anchorRef={anchorRef} placement="bottom-start" layer="popover" className="sprite-picker" onDismiss={onClose}>
      <Box className="sprite-picker__tabs">
        <Tabs
          tabs={[{ id: AUTO_PACK_ID, label: 'Auto' }, ...packs.map((pack) => ({ id: pack.id, label: pack.name }))]}
          activeTab={packId}
          onTabChange={setPackId}
        />
      </Box>
      <Box className="sprite-picker__tiles">
        {tiles.map((tile) => (
          <Pressable
            key={tile.position}
            className="sprite-picker__tile"
            title={tile.position}
            onClick={() => {
              onPick({ position: tile.position, ...(packId === AUTO_PACK_ID ? {} : { pack: packId }) });
              onClose();
            }}
          >
            <Image frame fit="contain" src={glyphUrlOf(tile.source)} alt={tile.position} className="sprite-picker__thumb" />
            <Text className="sprite-picker__label">{tile.position}</Text>
          </Pressable>
        ))}
      </Box>
    </Anchored>
  );
};

export { GlyphPickerGrid };
