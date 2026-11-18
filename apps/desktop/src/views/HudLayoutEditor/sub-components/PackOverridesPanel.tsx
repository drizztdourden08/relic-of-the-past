/* @layer renderer-components @kind component */
import { Box, IconButton, Select, Text } from '@drizztdourden08/tessera/primitives';
import { UploadField } from '@app/compounds/UploadField';
import { GLYPH_IMAGE_TYPES } from '../HudLayoutEditor.constants';
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { PackOverridesPanelProps } from './PackOverridesPanel.type';
import { useT } from '@drizztdourden08/brock-react';

const PackOverridesPanel = (props: PackOverridesPanelProps) => {
  const t = useT();
  const { pack, positions, target, busy, onPosition, onDeletePack, onImport, onRemove } = props;
  const overrides = Object.keys(pack.glyphs) as GlyphPosition[];

  return (
    <Box className="hud-editor-packs__custom">
      <Box className="hud-editor-packs__row">
        <Select
          size="sm"
          value={target ?? ''}
          options={positions.map((p) => ({ value: p, label: p }))}
          placeholder={t('hud-editor:pack-overrides-panel.placeholder.choose-a-button')}
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

      <UploadField
        variant="block"
        accept={GLYPH_IMAGE_TYPES}
        label={target ? `Drop an image for ${target}` : 'No buttons to import for'}
        hint={t('hud-editor:pack-overrides-panel.hint.png-svg-gif-jpeg-or')}
        disabled={busy || !target}
        onFiles={(files) => { if (target && files[0]) onImport(pack.id, target, files[0]); }}
      />

      <Box className="hud-editor-packs__row">
        {overrides.length === 0 && <Text className="hud-editor__hint">{t('hud-editor:pack-overrides-panel.text.nothing-imported-yet')}</Text>}
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
