/* @layer renderer-components @kind component */
/**
 * A `sprite` element's file, picked by eye and shown as itself. That is the actual
 * thumbnail plus its human label, not the raw slug (`hud-heart-full`) in a
 * text box. Clicking the control is the only way to change it; there is
 * nothing left to type.
 *
 * THIS ROW IS NOW `ReferenceField`, WHICH IT INVENTED. Contract §31.4 built
 * the shape here first; phase 9 generalised it to glyph, button face, switch
 * case and repeat child, so the sprite-only `.hud-sprite-field` class and its
 * custom markup are gone and this call site renders the shared control. What
 * a person sees is unchanged, which is the point of doing it this way round.
 *
 * The sprite's own natural box (16x16 unless the extraction cut something
 * else, like the bomb/arrow counters' 16x8 strip) is no longer asked of the
 * author here either. `intrinsic-size.ts` reads it from the sprite manifest
 * now (`SPRITE_BOX_BY_FILE`, derived from the extraction recipe). `spec.box`
 * still round-trips for a stored document that already set one by hand.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { SpritePicker } from '@ds/composites/SpritePicker';
import { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from '@shared/game/data/sprite-manifest/manifest';
import { spriteLabel, spriteUrl } from '../../behavior/node-art';
import { ReferenceField } from '../ReferenceField';
import { SpriteExtractionNotice } from '../SpriteExtractionNotice';
import type { HudElementSpec } from '@shared/types/hud';

interface SpriteContentProps {
  spec: Extract<HudElementSpec, { type: 'sprite' }>;
  onChange: (patch: Partial<Extract<HudElementSpec, { type: 'sprite' }>>) => void;
}

const SpriteContent = (props: SpriteContentProps) => {
  const { spec, onChange } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <Box className="hud-inspect__group">
      <ReferenceField
        src={spriteUrl(spec.file)}
        name={spriteLabel(spec.file)}
        onOpen={() => setOpen(true)}
        anchorRef={anchorRef}
        aria-label={`Sprite: ${spriteLabel(spec.file)}`}
      >
        <SpritePicker
          open={open}
          anchorRef={anchorRef}
          sprites={SPRITE_MANIFEST}
          categories={CATEGORY_ORDER}
          categoryLabels={CATEGORY_LABELS}
          spriteUrl={spriteUrl}
          onClose={() => setOpen(false)}
          onPick={(file) => onChange({ file })}
          notice={<SpriteExtractionNotice />}
        />
      </ReferenceField>
    </Box>
  );
};

export { SpriteContent };
export type { SpriteContentProps };
