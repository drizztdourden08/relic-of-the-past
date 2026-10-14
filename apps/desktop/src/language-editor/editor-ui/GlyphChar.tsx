/* @layer renderer-components @kind component */
import { Box, Canvas, Text } from '@drizztdourden08/tessera/primitives';
import { widthOf } from '@rotp/languages';
import { isMergedSecond } from '../editor/merged-glyph';
import { useGlyphPair } from './behavior/useGlyphPair';
import { CELL_W } from '@rotp/design/packs';
import type { CSSProperties } from 'react';
import type { GlyphMetrics } from '@rotp/languages';
import type { GlyphCharProps } from './GlyphChar.type';
import '@rotp/design';

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
  const { name, metrics } = props;
  const { glyph, secondGlyph, firstRef, secondRef } = useGlyphPair(props);

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
