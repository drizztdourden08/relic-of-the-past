/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SpritePicker } from '@app/compounds/SpritePicker';
import { CATEGORY_ORDER, SPRITE_MANIFEST } from '@rotp/game-data';
import { spriteLabel, spriteUrl } from '@app/hud-layout-editing/node-art';
import { ReferenceField } from './ReferenceField';
import { SpriteExtractionNotice } from './SpriteExtractionNotice';
import type { SpriteContentProps } from './SpriteContent.type';
import { useT } from '@drizztdourden08/brock-react';
import { useSpriteCategoryLabels } from '@app/hooks/sprite-category-labels';

const SpriteContent = (props: SpriteContentProps) => {
  const t = useT();
  const categoryLabels = useSpriteCategoryLabels();
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
        aria-label={t('hud-editor:sprite-content.aria', { name: spriteLabel(spec.file) })}
      >
        <SpritePicker
          open={open}
          anchorRef={anchorRef}
          sprites={SPRITE_MANIFEST}
          categories={CATEGORY_ORDER}
          categoryLabels={categoryLabels}
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
