/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, Button, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { AUTO_PACK_ID } from '@rotp/input-mapping';
import { PackOverridesPanel } from './PackOverridesPanel';
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { GlyphPackPickerProps } from './GlyphPackPicker.type';

const GlyphPackPicker = (props: GlyphPackPickerProps) => {
  const { value, packs, custom, positions, busy, onChange, onCreatePack, onDeletePack, onImport, onRemove } = props;
  const [position, setPosition] = useState<GlyphPosition | ''>('');
  const packOptions = useMemo(
    () => [{ value: AUTO_PACK_ID, label: 'Auto' }, ...packs.map((pack) => ({ value: pack.id, label: pack.name }))],
    [packs],
  );

  const selectedCustom = custom.find((pack) => pack.id === value) ?? null;
  const target = (position || positions[0]);

  return (
    <Box className="hud-editor-packs">
      <Box className="hud-editor-packs__row">
        <SegmentedControl size="sm" aria-label="Glyph pack" value={value} options={packOptions} onChange={onChange} />
        <Button variant="ghost" size="sm" disabled={busy} onClick={onCreatePack}>+ Import your own</Button>
      </Box>

      <Text className="hud-editor__hint">
        Auto follows the controller in hand. A custom pack replaces only the buttons you give it
        an image for; everything else keeps the pack it falls back to.
      </Text>

      {selectedCustom && (
        <PackOverridesPanel
          pack={selectedCustom}
          positions={positions}
          target={target}
          busy={busy}
          onPosition={setPosition}
          onDeletePack={onDeletePack}
          onImport={onImport}
          onRemove={onRemove}
        />
      )}
    </Box>
  );
};

export { GlyphPackPicker };
