/* @layer renderer-components @kind component */
/**
 * A dialogue line as read-only text, in the game's own face.
 *
 * Rows are shown the way the box shows them — up to three at a time, split
 * where the line says to start a new row or to scroll — so the shape of the
 * line is recognisable at a glance.
 *
 * Each character advances by its own width from the set's table, not by the
 * width of the face we happen to draw with, so the length of a line here is the
 * length it will have in the box.
 *
 * The non-letters are told apart by what they ARE. A picture character is one of
 * the alphabet's own characters, so it is drawn from the set's font exactly as
 * the box would draw it. A control code or a substitution draws nothing at all
 * on screen, so it keeps an icon of ours: something has to stand where it sits,
 * and it must not be mistaken for words.
 */
import { Icon } from '@iconify/react';
import { Box, Text } from '@ds/primitives';
import { GlyphChar, iconForToken, pictureGlyphIndex } from '../editor-ui';
import { TextRun } from './TextRun';
import { codeInfoFor } from '@shared/game/language';
import type { GlyphMetrics, GlyphSheet, Token } from '@shared/game/language';
import './EntryText.css';

type EntryTextProps = {
  tokens: Token[];
  /** The set's alphabet and widths; null while its font is still being read. */
  metrics: GlyphMetrics | null;
  /** The set's glyph tiles, which a picture character is drawn from. */
  sheet: GlyphSheet | null;
};

/** Splits a line where the engine would move to another row. */
const ROW_BREAKERS = new Set(['Scroll', 'Waitkey']);

const isRowBreak = (token: Token): boolean => (
  token.t === 'break' || (token.t === 'cmd' && ROW_BREAKERS.has(token.name))
);

/** One row's worth of tokens, in order. */
const splitRows = (tokens: Token[]): Token[][] => {
  const rows: Token[][] = [[]];
  for (const token of tokens) {
    if (isRowBreak(token)) { rows.push([]); continue; }
    rows[rows.length - 1].push(token);
  }
  return rows.filter((row) => row.length > 0);
};

/** What a non-text token is called, for the icon's tooltip. */
const titleOf = (token: Token): string => {
  if (token.t === 'ref') return `glossary: ${token.key}`;
  if (token.t === 'var') return token.name === 'player-name' ? "the player's name" : 'number digit';
  if (token.t === 'cmd') return codeInfoFor(token.name)?.label ?? token.name;
  return '';
};

/**
 * The picture character a token draws, or null when it draws none. A bracketed
 * name is spelled the same as a control code, so only the set's own alphabet can
 * say which of the two it is — and a code carrying a value never is one.
 */
const glyphNameOf = (token: Token, metrics: GlyphMetrics | null): string | null => (
  token.t === 'cmd' && token.param === undefined && pictureGlyphIndex(token.name, metrics) !== null
    ? token.name
    : null
);

const EntryText = (props: EntryTextProps) => {
  const { tokens, metrics, sheet } = props;
  const rows = splitRows(tokens);

  if (rows.length === 0) {
    return <Text className="entry-text__empty" variant="caption">This line has no text.</Text>;
  }

  return (
    <Box className="entry-text">
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex} className="entry-text__row game-text">
          {row.map((token, index) => {
            if (token.t === 'text') {
              return <TextRun key={index} text={token.v} metrics={metrics} />;
            }
            const glyph = glyphNameOf(token, metrics);
            if (glyph !== null) {
              return <GlyphChar key={index} name={glyph} sheet={sheet} metrics={metrics} />;
            }
            return (
              <Text key={index} as="span" className="entry-text__mark" title={titleOf(token)}>
                <Icon icon={iconForToken(token)} />
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export { EntryText };
export type { EntryTextProps };
