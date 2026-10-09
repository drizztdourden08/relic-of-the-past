/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Flex, SegmentedControl, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { SpritePicker } from '@domains/app/compounds/SpritePicker';
import { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from '@shared/game/data/sprite-manifest/manifest';
import { glyphArtUrl } from '../behavior/glyph-art';
import { spriteLabel, spriteUrl } from '../behavior/node-art';
import { GlyphPickerGrid } from './GlyphPickerGrid';
import { ReferenceField } from './ReferenceField';
import { SpriteExtractionNotice } from './SpriteExtractionNotice';
import type { ButtonStateRowProps } from './ButtonStateRow.type';

const ButtonStateRow = (props: ButtonStateRowProps) => {
  const { state, required, face, glyphPacks, onChange } = props;
  const [pickerOpen, setPickerOpen] = useState<'sprite' | 'glyph' | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const from = face?.from ?? 'glyph';

  const art = face === undefined ? null : face.from === 'image'
    ? { src: face.file ? spriteUrl(face.file) : undefined, name: face.file ? spriteLabel(face.file) : 'choose a sprite...', kind: undefined }
    : { src: glyphArtUrl(glyphPacks, face.pack, face.glyph), name: face.glyph, kind: face.pack };

  return (
    <Flex direction="column" gap="2xs" className={`hud-button-state${face ? ' is-set' : ''}`}>
      <Flex gap="2xs" align="center" className="hud-button-state__head">
        <Text className="hud-inspect__sub">{state}</Text>
        {!required && (
          <Toggle
            size="sm"
            checked={face !== undefined}
            label={face ? '' : 'falls back to idle'}
            onChange={(on) => onChange(on ? { from: 'glyph', pack: 'generic', glyph: 'A' } : undefined)}
          />
        )}
      </Flex>
      {face && art && (
        <Flex direction="column" gap="2xs" className="hud-button-state__body">
          <SegmentedControl
            size="sm"
            value={from}
            options={[{ value: 'glyph', label: 'glyph' }, { value: 'image', label: 'image' }]}
            onChange={(next) => onChange(next === 'image' ? { from: 'image', file: '' } : { from: 'glyph', pack: 'generic', glyph: 'A' })}
          />
          <ReferenceField
            compact
            src={art.src}
            name={art.name}
            kind={art.kind}
            onOpen={() => setPickerOpen(face.from === 'image' ? 'sprite' : 'glyph')}
            anchorRef={anchorRef}
            aria-label={`${state} face: ${art.name}`}
          >
            <SpritePicker
              open={pickerOpen === 'sprite'}
              anchorRef={anchorRef}
              sprites={SPRITE_MANIFEST}
              categories={CATEGORY_ORDER}
              categoryLabels={CATEGORY_LABELS}
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
      )}
    </Flex>
  );
};

export { ButtonStateRow };
export type { ButtonStateRowProps } from './ButtonStateRow.type';
