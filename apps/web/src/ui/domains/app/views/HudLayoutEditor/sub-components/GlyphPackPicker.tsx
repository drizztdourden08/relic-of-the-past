/* @layer renderer-components @kind component */
/**
 * Which artwork the chips wear.
 *
 * "Auto" is the default and means the pad in hand: a player who never opens
 * this setting sees their own controller. Choosing a pack explicitly overrides
 * the device, and a custom pack overrides only the positions it has an
 * image for and inherits the rest, so importing a single button is a
 * one-minute job instead of a twenty-glyph commitment.
 *
 * Only the positions the current cluster actually draws are offered, because a
 * glyph imported for a control this pad does not report is invisible work.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import { IconButton } from '@ds/primitives/IconButton';
import { Select } from '@ds/primitives/Select';
import { Text } from '@ds/primitives/Text';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { GLYPH_IMAGE_TYPES } from '../HudLayoutEditor.constants';
import type { GlyphPosition } from '@app/lib/hud/custom-glyph-store';
import type { GlyphPack } from '@shared/types/hud';

interface GlyphPackPickerProps {
  value: string;
  packs: readonly GlyphPack[];
  custom: readonly GlyphPack[];
  /** The positions this cluster draws, which are the only ones worth importing for. */
  positions: readonly GlyphPosition[];
  busy: boolean;
  onChange: (packId: string) => void;
  onCreatePack: () => void;
  onDeletePack: (packId: string) => void;
  onImport: (packId: string, position: GlyphPosition, file: File) => void;
  onRemove: (packId: string, position: GlyphPosition) => void;
}

const GlyphPackPicker = (props: GlyphPackPickerProps) => {
  const { value, packs, custom, positions, busy, onChange, onCreatePack, onDeletePack, onImport, onRemove } = props;
  const [position, setPosition] = useState<GlyphPosition | ''>('');

  const selectedCustom = custom.find((pack) => pack.id === value) ?? null;
  const target = (position || positions[0]) as GlyphPosition | undefined;
  const overrides = Object.keys(selectedCustom?.glyphs ?? {}) as GlyphPosition[];

  return (
    <Box className="hud-editor-packs">
      <Box className="hud-editor-packs__row">
        <Button
          variant="bare"
          className={`hud-editor-packs__chip${value === AUTO_PACK_ID ? ' is-selected' : ''}`}
          aria-pressed={value === AUTO_PACK_ID}
          onClick={() => onChange(AUTO_PACK_ID)}
        >
          Auto
        </Button>
        {packs.map((pack) => (
          <Button
            variant="bare"
            key={pack.id}
            className={`hud-editor-packs__chip${value === pack.id ? ' is-selected' : ''}${pack.builtIn ? '' : ' is-custom'}`}
            aria-pressed={value === pack.id}
            onClick={() => onChange(pack.id)}
          >
            {pack.name}
          </Button>
        ))}
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
export type { GlyphPackPickerProps };
