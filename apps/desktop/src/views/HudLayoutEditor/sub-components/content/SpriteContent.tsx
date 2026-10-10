/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SpritePicker } from '@app/compounds/SpritePicker';
import { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from '@rotp/game-data';
import { spriteLabel, spriteUrl } from '@app/hud-layout-editing/node-art';
import { ReferenceField } from '../ReferenceField';
import { SpriteExtractionNotice } from '../SpriteExtractionNotice';
import type { SpriteContentProps } from './SpriteContent.type';

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
export type { SpriteContentProps } from './SpriteContent.type';
