/* @layer renderer-components @kind component */
/**
 * One non-text token as it appears INSIDE a line.
 *
 * Three shapes, decided by what the thing is, not by how it is spelled. A
 * picture character is drawn as the character itself, with the game's own pixels,
 * because that is what the player will see and a chip would only get in the way.
 * A substitution is a tag holding the text it stands for, in the game's face and
 * as wide as that text can ever be, so the space it will really need is on screen
 * and not implied. A control code or a glossary reference draws nothing at
 * all in the game, so it is a compact chip: a symbol plus the plain-language name
 * from the catalog, never the engine's bracket name, which a translator has no
 * reason to learn.
 *
 * What no longer reaches here is line structure. A row marker and the wait that
 * closes a box are properties of the LINE now, so neither is a chip in the run
 * any more. The gutter says which row a line lands on, and a marker at the
 * line's end says where the box stops. The chip can still draw one, because a
 * paste from elsewhere may carry it, and drawing it is better than dropping it.
 *
 * The node is an atom, so the editor treats it as one indivisible character: the
 * caret steps over it, a click selects it whole, and Backspace or Delete removes
 * it. Nothing inside is editable, which is what keeps a half-typed `[Wai` from
 * ever existing.
 */
import { NodeViewWrapper } from '@tiptap/react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Text } from '@ds/primitives';
import { codeInfoFor } from '@shared/game/language';
import { GlyphChar } from './GlyphChar';
import { iconForCodeName, GLOSSARY_ICON } from './icon-for-token';
import { substitutionCells } from './substitution-cells';
import type { CSSProperties } from 'react';
import type { ReactNodeViewProps } from '@tiptap/react';
import type { DialogueTokenAttrs } from './editor-contract';
import type { GlyphFont } from './editor-ui.type';
import './TokenAtom.css';

type TokenAtomProps = ReactNodeViewProps & {
  /** Bracket names this language spells a picture character with. */
  glyphNames: ReadonlySet<string>;
  /** The pack's font, as it stood when this atom last rendered. */
  font: GlyphFont;
};

const ICON_PX = 11;

/** The catalog name behind an attribute set, or null for a glossary reference. */
const codeNameOf = (attrs: DialogueTokenAttrs): string | null => {
  if (attrs.kind === 'break') return String(attrs.row);
  if (attrs.kind === 'var') return attrs.name === 'player-name' ? 'Name' : 'Number';
  if (attrs.kind === 'cmd') return attrs.name;
  return null;
};

/** An advance in game pixels as a CSS length, scaled with the rest of the line. */
const advanceOf = (widthPx: number): CSSProperties => (
  { width: `calc(${widthPx} * var(--game-scale) * 1px)` }
);

/** The number the chip shows after its name, when the token carries one. */
const valueOf = (attrs: DialogueTokenAttrs): number | null => {
  if (attrs.kind === 'cmd') return attrs.param;
  if (attrs.kind === 'var') return attrs.slot;
  return null;
};

const TokenAtom = (props: TokenAtomProps) => {
  const { node, selected, glyphNames, font } = props;

  const attrs = node.attrs as DialogueTokenAttrs;
  const name = codeNameOf(attrs);
  const isGlyph = attrs.kind === 'cmd' && name !== null && glyphNames.has(name);
  const info = name === null ? null : codeInfoFor(name);
  const label = attrs.kind === 'ref' ? (attrs.key ?? '') : (info?.label ?? name ?? '');
  const value = valueOf(attrs);
  const icon = name === null ? GLOSSARY_ICON : iconForCodeName(name);
  const ring = selected ? ' token-atom--selected' : '';

  const description = attrs.kind === 'ref'
    ? `glossary term ${label}`
    : `${label}${info?.description ? `, ${info.description}` : ''}`;

  if (isGlyph) {
    return (
      <NodeViewWrapper
        as="span"
        className={`token-atom token-atom--glyph${ring}`}
        contentEditable={false}
        title={`picture character ${name}`}
      >
        <GlyphChar name={name} sheet={font.sheet} metrics={font.metrics} />
      </NodeViewWrapper>
    );
  }

  /*
   * A substitution is a TAG, drawn in the game's face and reserving the widest
   * it could ever be: six of the language's widest characters for a name, one
   * digit for a number. That is exactly what the row measurement charges it, so
   * what stands on screen accounts for the space the real value will need. A
   * chip sized to the letters "PLAYER" would promise room the game may not have.
   *
   * Everything else draws nothing on screen at all, so it stays an icon.
   */
  if (attrs.kind === 'var') {
    const cells = substitutionCells(attrs.name === 'player-name', font.metrics);
    const characters = [...cells.text];
    return (
      <NodeViewWrapper
        as="span"
        className={`token-atom token-atom--var token-atom--substitution${ring}`}
        contentEditable={false}
        title={description}
        style={cells.cellPx === null ? undefined : advanceOf(cells.cellPx * characters.length)}
      >
        {characters.map((character, at) => (
          <Text
            key={at}
            as="span"
            className="game-text token-atom__stands-for"
            style={cells.cellPx === null ? undefined : advanceOf(cells.cellPx)}
          >
            {character}
          </Text>
        ))}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`token-atom token-atom--${attrs.kind}${ring}`}
      contentEditable={false}
      title={description}
    >
      <Box as="span" className="token-atom__icon" aria-hidden="true">
        <IconifyIcon icon={icon} width={ICON_PX} height={ICON_PX} />
      </Box>
      {attrs.kind === 'ref' ? (
        <Text as="span" className="token-atom__label">{label}</Text>
      ) : null}
      {value === null ? null : (
        <Text as="span" className="token-atom__value">{value}</Text>
      )}
    </NodeViewWrapper>
  );
};

export { TokenAtom };
export type { TokenAtomProps };
