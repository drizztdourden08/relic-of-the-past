/* @layer renderer-components @kind hook */
import { useGlyphCanvas } from '@rotp/design/packs';
import { mergedSecondOf } from '../../editor/merged-glyph';
import { pictureGlyphIndex } from '../glyph-index';
import type { GlyphCharProps } from '../GlyphChar.type';

const useGlyphPair = (props: GlyphCharProps) => {
  const { name, sheet, metrics } = props;
  const second = mergedSecondOf(name);
  const glyph = pictureGlyphIndex(name, metrics);
  const secondGlyph = second === null ? null : pictureGlyphIndex(second, metrics);
  const tiles = sheet?.tiles ?? null;
  const firstRef = useGlyphCanvas(tiles, glyph);
  const secondRef = useGlyphCanvas(tiles, secondGlyph);
  return { glyph, secondGlyph, firstRef, secondRef };
};

export { useGlyphPair };
