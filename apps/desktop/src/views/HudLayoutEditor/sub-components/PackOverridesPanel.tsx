/* @layer renderer-components @kind component */
import { Box, DropZone, IconButton, Select, Text } from '@drizztdourden08/tessera/primitives';
import { GLYPH_IMAGE_TYPES } from '../HudLayoutEditor.constants';
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { PackOverridesPanelProps } from './PackOverridesPanel.type';

const PackOverridesPanel = (props: PackOverridesPanelProps) => {
  const { pack, positions, target, busy, onPosition, onDeletePack, onImport, onRemove } = props;
  const overrides = Object.keys(pack.glyphs) as GlyphPosition[];

  return (
    <Box className="hud-editor-packs__custom">
      <Box className="hud-editor-packs__row">
        <Select
          size="sm"
          value={target ?? ''}
          options={positions.map((p) => ({ value: p, label: p }))}
          placeholder="Choose a button"
          onChange={(next) => onPosition(next as GlyphPosition)}
        />
        <IconButton
          variant="ghost"
          size="sm"
          label={`Delete ${pack.name}`}
          disabled={busy}
          onClick={() => onDeletePack(pack.id)}
        >
          ✕
        </IconButton>
      </Box>

      <DropZone
        accept={GLYPH_IMAGE_TYPES}
        label={target ? `Drop an image for ${target}` : 'No buttons to import for'}
        hint="PNG, SVG, GIF, JPEG or WebP. Drawn at 16x16 game pixels"
        disabled={busy || !target}
        onDrop={(files) => { if (target && files[0]) onImport(pack.id, target, files[0]); }}
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
              onClick={() => onRemove(pack.id, p)}
            >
              ✕
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { PackOverridesPanel };
