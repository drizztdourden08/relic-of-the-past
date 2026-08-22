/* @layer renderer-components @kind component */
/**
 * One picture character, drawn with the game's own pixels.
 *
 * A button face, an arrow, a heart: these are characters of the dialogue
 * alphabet, not icons of ours, so a lookalike from an icon set would be a small
 * lie in the middle of a line an author is trying to judge. The pixels come from
 * the language pack's OWN font — every pack carries one, and it is the same data
 * the game draws from — so a picture character shows up with nothing to extract
 * and nothing to install first.
 *
 * The cell is exactly one character wide and one line tall, so a picture sits in
 * the run without disturbing what the gutter counts beside it.
 *
 * Two gaps stay honest. While the pack's font is still being read there is no
 * sheet to draw from, so the cell holds its place and stays empty rather than
 * flashing text that is about to be replaced. And a localized alphabet may name a
 * picture the base one never had: nothing is behind that name at all, so it falls
 * back to the bracketed name in the game's face, which is legible and true.
 *
 * A few pictures are spelled as a PAIR of alphabet entries. Each is a character in
 * its own right, so each draws its own cell and the two side by side reassemble
 * the picture — the same way the engine draws them.
 */
import { Canvas, Text } from '@ds/primitives';
import { pictureGlyphIndex } from './glyph-index';
import { useGlyphCanvas } from './behavior/useGlyphCanvas';
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

const GlyphChar = (props: GlyphCharProps) => {
  const { name, sheet, metrics } = props;

  const glyph = pictureGlyphIndex(name, metrics);
  const canvasRef = useGlyphCanvas(sheet?.tiles ?? null, glyph);

  // Metrics in hand and no character behind the name: the alphabet genuinely has
  // none, and no amount of waiting will produce one.
  if (metrics !== null && glyph === null) {
    return <Text as="span" className="game-text glyph-char__name">{`[${name}]`}</Text>;
  }

  return <Canvas ref={canvasRef} className="glyph-char" role="img" aria-label={name} />;
};

export { GlyphChar };
export type { GlyphCharProps };
