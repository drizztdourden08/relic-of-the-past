/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, Button, DropZone, IconButton, SegmentedControl, Select, Text } from '@drizztdourden08/tessera/primitives';
import { AUTO_PACK_ID } from '@rotp/input-mapping';
import { GLYPH_IMAGE_TYPES } from '../HudLayoutEditor.constants';
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
  const target = (position || positions[0]) as GlyphPosition | undefined;
  const overrides = Object.keys(selectedCustom?.glyphs ?? {}) as GlyphPosition[];

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
        <Box className="hud-editor-packs__custom">
          <Box className="hud-editor-packs__row">
            <Select
              size="sm"
              value={target ?? ''}
              options={positions.map((p) => ({ value: p, label: p }))}
              placeholder="Choose a button"
              onChange={(next) => setPosition(next as GlyphPosition)}
            />
            <IconButton
              variant="ghost"
              size="sm"
              label={`Delete ${selectedCustom.name}`}
              disabled={busy}
              onClick={() => onDeletePack(selectedCustom.id)}
            >
              ✕
            </IconButton>
          </Box>

          <DropZone
            accept={GLYPH_IMAGE_TYPES}
            label={target ? `Drop an image for ${target}` : 'No buttons to import for'}
            hint="PNG, SVG, GIF, JPEG or WebP. Drawn at 16x16 game pixels"
            disabled={busy || !target}
            onDrop={(files) => { if (target && files[0]) onImport(selectedCustom.id, target, files[0]); }}
          />

          <Box className="hud-editor-packs__row">
            {overrides.length === 0 && <Text className="hud-editor__hint">Nothing imported yet.</Text>}
            {overrides.map((p) => (
              <Box key={p} className="hud-editor-packs__override">
                <Text>{p}</Text>
                <IconButton
                  variant="ghost"
                  size="sm"
                  label={`Remove ${p}`}
                  disabled={busy}
                  onClick={() => onRemove(selectedCustom.id, p)}
                >
                  ✕
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { GlyphPackPicker };
export type { GlyphPackPickerProps } from './GlyphPackPicker.type';
