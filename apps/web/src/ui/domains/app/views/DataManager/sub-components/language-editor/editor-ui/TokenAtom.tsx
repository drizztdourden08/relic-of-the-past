/* @layer renderer-components @kind component */
import { NodeViewWrapper } from '@tiptap/react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Text } from '@ds/primitives';
import { codeInfoFor } from '@shared/game/language';
import { GlyphChar } from './GlyphChar';
import { iconForCodeName, GLOSSARY_ICON } from './icon-for-token';
import { substitutionCells } from './substitution-cells';
import type { CSSProperties } from 'react';
import type { DialogueTokenAttrs } from './editor-contract';
import { ICON_PX } from './TokenAtom.constants';
import type { TokenAtomProps } from './TokenAtom.type';
import './TokenAtom.css';

const codeNameOf = (attrs: DialogueTokenAttrs): string | null => {
  if (attrs.kind === 'break') return String(attrs.row);
  if (attrs.kind === 'var') return attrs.name === 'player-name' ? 'Name' : 'Number';
  if (attrs.kind === 'cmd') return attrs.name;
  return null;
};

const advanceOf = (widthPx: number): CSSProperties => (
  { width: `calc(${widthPx} * var(--game-scale) * 1px)` }
);

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
