/* @layer renderer-components @kind component */
import { Box, Canvas, Text } from '@drizztdourden08/tessera/primitives';
import { widthOf } from '@shared/game/language';
import { isMergedSecond, mergedSecondOf } from '../editor/merged-glyph';
import { pictureGlyphIndex } from './glyph-index';
import { CELL_W, useGlyphCanvas } from '@domains/packs/language/compounds/glyph';
import type { CSSProperties } from 'react';
import type { GlyphMetrics } from '@shared/game/language';
import type { GlyphCharProps } from './GlyphChar.type';
import '@domains/packs/language/compounds/glyph/GlyphChar.css';

const advanceStyle = (
  glyphs: (number | null)[],
  metrics: GlyphMetrics | null,
): CSSProperties | undefined => {
  if (metrics === null) return undefined;
  const drawn = glyphs.filter((glyph): glyph is number => glyph !== null);
  if (drawn.length === 0) return undefined;
  const advance = drawn.reduce((total, glyph) => total + widthOf(glyph, metrics), 0);
  const boxes = Math.round((advance / CELL_W) * 1000) / 1000;
  return { '--glyph-advance': `calc(var(--glyph-cell-w) * ${boxes})` } as CSSProperties;
};

const GlyphChar = (props: GlyphCharProps) => {
  const { name, sheet, metrics } = props;

  const second = mergedSecondOf(name);
  const glyph = pictureGlyphIndex(name, metrics);
  const secondGlyph = second === null ? null : pictureGlyphIndex(second, metrics);
  const firstRef = useGlyphCanvas(sheet?.tiles ?? null, glyph);
  const secondRef = useGlyphCanvas(sheet?.tiles ?? null, secondGlyph);

  if (isMergedSecond(name)) return null;

  if (metrics !== null && glyph === null) {
    return <Text as="span" className="game-text glyph-char__name">{`[${name}]`}</Text>;
  }

  const merged = secondGlyph !== null;

  return (
    <Box
      as="span"
      className={`glyph-char${merged ? ' glyph-char--pair' : ''}`}
      style={advanceStyle([glyph, secondGlyph], metrics)}
      role="img"
      aria-label={name}
    >
      <Canvas ref={firstRef} className="glyph-char__ink" aria-hidden="true" />
      {merged ? <Canvas ref={secondRef} className="glyph-char__ink" aria-hidden="true" /> : null}
    </Box>
  );
};

export { GlyphChar };
