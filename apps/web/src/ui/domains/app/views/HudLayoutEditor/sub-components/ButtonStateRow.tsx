/* @layer renderer-components @kind component */
/**
 * One `ButtonState`'s face. It is an image, chosen from the same sprite grid the
 * toolbar's own Sprite insert uses, or a glyph chosen VISUALLY from
 * `GlyphPickerGrid` (never typed by name). An absent optional state says it
 * falls back to `idle`, which is the one state this row never lets go empty.
 *
 * BOTH FACES ARE `ReferenceField`S NOW (phase 9), and the image one has lost
 * its text box entirely. This row had the two halves of the same bug side by
 * side: the glyph face printed `generic · A` beside a `choose...` link, and the
 * image face offered a raw `TextInput` over the sprite slug beside a `pick...`
 * link. In that field a typo produced a face that silently draws nothing.
 * Neither can be typed into any more, which is the rule the sprite branch set
 * for the whole section (contract §31.4: "nothing in the section can be typed
 * into any more"). Four faces per button, so this is where the slug-reading
 * cost the most.
 */
import { useRef, useState } from 'react';
import { Flex } from '@ds/primitives/Flex';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Text } from '@ds/primitives/Text';
import { Toggle } from '@ds/primitives/Toggle';
import { SpritePicker } from '@ds/composites/SpritePicker';
import { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from '@shared/game/data/sprite-manifest/manifest';
import { glyphArtUrl } from '../behavior/glyph-art';
import { spriteLabel, spriteUrl } from '../behavior/node-art';
import { GlyphPickerGrid } from './GlyphPickerGrid';
import { ReferenceField } from './ReferenceField';
import { SpriteExtractionNotice } from './SpriteExtractionNotice';
import type { GlyphPack, HudButtonFace } from '@shared/types/hud';

interface ButtonStateRowProps {
  state: string;
  required?: boolean;
  face: HudButtonFace | undefined;
  glyphPacks: readonly GlyphPack[];
  onChange: (next: HudButtonFace | undefined) => void;
}

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
export type { ButtonStateRowProps };
