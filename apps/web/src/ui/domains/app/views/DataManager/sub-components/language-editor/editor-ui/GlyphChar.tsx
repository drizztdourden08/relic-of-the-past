/* @layer renderer-components @kind component */
/**
 * One picture character, drawn with the game's own pixels.
 *
 * A button face, an arrow, a heart: these are characters of the dialogue
 * alphabet, not icons of ours, so a lookalike from an icon set would be a small
 * lie in the middle of a line an author is trying to judge. The pixels come from
 * the language pack's OWN font, the same data the game draws from, so a picture
 * character shows up with nothing to extract or install first.
 *
 * The cell ADVANCES by the character's own width out of the pack's table, exactly
 * as a typed character's cell does. It used to advance a full cell whatever the
 * character was worth, which put the ruler and the gutter's figure into
 * disagreement on any entry holding a picture. The ink keeps its full box and is
 * allowed to overflow the advance, the same trade the letters make.
 *
 * A pair of alphabet entries that spell ONE picture is drawn as one merged cell:
 * both halves inside a single box that advances by the sum of their widths, and
 * the closing half draws nothing of its own. Two separate boxes gave a caret
 * position in the middle of a picture and a click that could only select half of
 * it (see `merged-glyph.ts`).
 *
 * Two gaps stay honest. While the pack's font is still being read there is no
 * sheet to draw from, so the cell holds its place and stays empty instead of
 * flashing text that is about to be replaced. And a localized alphabet may name a
 * picture the base one never had: nothing is behind that name, so it falls back
 * to the bracketed name in the game's face.
 */
import { Box, Canvas, Text } from '@ds/primitives';
import { widthOf } from '@shared/game/language';
import { isMergedSecond, mergedSecondOf } from '../editor/merged-glyph';
import { pictureGlyphIndex } from './glyph-index';
import { CELL_W } from './glyph-cell-geometry';
import { useGlyphCanvas } from './behavior/useGlyphCanvas';
import type { CSSProperties } from 'react';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';
import './GlyphChar.css';

type GlyphCharProps = {
  /** The bracket name as parsed out of the line, without its brackets. */
  name: string;
  /** The pack's glyph tiles; null while its font is still being read. */
  sheet: GlyphSheet | null;
  /** The pack's alphabet and widths; null while its font is still being read. */
  metrics: GlyphMetrics | null;
};

/**
 * The cell's advance, as a MULTIPLE of one ink box, not as a length.
 *
 * A caller decides how big an ink box is, so a length in game pixels would
 * override that choice and size the cell for the wrong surface. The line uses
 * the game's own cell, while the read-only card and the toolbar set theirs from
 * their own text size. A ratio scales with whatever box the caller chose.
 */
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

  // The closing half of a merged picture: the opening half already drew both, so
  // this one occupies nothing at all.
  if (isMergedSecond(name)) return null;

  // Metrics in hand and no character behind the name: the alphabet has
  // none, and no amount of waiting will produce one.
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
export type { GlyphCharProps };
