/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Flex, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { SpritePicker } from '@app/compounds/SpritePicker';
import { CATEGORY_ORDER, SPRITE_MANIFEST } from '@rotp/game-data';
import { spriteUrl } from '@app/hud-layout-editing/node-art';
import { GlyphPickerGrid } from './GlyphPickerGrid';
import { ReferenceField } from './ReferenceField';
import { SpriteExtractionNotice } from './SpriteExtractionNotice';
import type { ButtonFaceBodyProps } from './ButtonFaceBody.type';
import { useT } from '@drizztdourden08/brock-react';
import { useSpriteCategoryLabels } from '@app/hooks/sprite-category-labels';

const ButtonFaceBody = (props: ButtonFaceBodyProps) => {
  const t = useT();
  const categoryLabels = useSpriteCategoryLabels();
  const { state, face, art, glyphPacks, onChange } = props;
  const [pickerOpen, setPickerOpen] = useState<'sprite' | 'glyph' | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <Flex direction="column" gap="2xs" className="hud-button-state__body">
      <SegmentedControl
        size="sm"
        value={face.from}
        options={[{ value: 'glyph', label: t('hud-editor:button-face.glyph') }, { value: 'image', label: t('hud-editor:button-face.image') }]}
        onChange={(next) => onChange(next === 'image' ? { from: 'image', file: '' } : { from: 'glyph', pack: 'generic', glyph: 'A' })}
      />
      <ReferenceField
        compact
        src={art.src}
        name={art.name}
        kind={art.kind}
        onOpen={() => setPickerOpen(face.from === 'image' ? 'sprite' : 'glyph')}
        anchorRef={anchorRef}
        aria-label={t('hud-editor:button-face.aria', { state, name: art.name })}
      >
        <SpritePicker
          open={pickerOpen === 'sprite'}
          anchorRef={anchorRef}
          sprites={SPRITE_MANIFEST}
          categories={CATEGORY_ORDER}
          categoryLabels={categoryLabels}
          spriteUrl={spriteUrl}
          onClose={() => setPickerOpen(null)}
          onPick={(file) => onChange({ from: 'image', file })}
          notice={<SpriteExtractionNotice />}
        />
        <GlyphPickerGrid
          open={pickerOpen === 'glyph'}
          anchorRef={anchorRef}
          packs={glyphPacks}
          onClose={() => setPickerOpen(null)}
          onPick={({ position, pack }) => onChange({ from: 'glyph', pack: pack ?? 'generic', glyph: position })}
        />
      </ReferenceField>
    </Flex>
  );
};

export { ButtonFaceBody };
