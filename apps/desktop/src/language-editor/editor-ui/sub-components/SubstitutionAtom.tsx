/* @layer renderer-components @kind component */
import { NodeViewWrapper } from '@tiptap/react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { substitutionCells } from '../substitution-cells';
import type { CSSProperties } from 'react';
import type { SubstitutionAtomProps } from '../TokenAtom.type';

const advanceOf = (widthPx: number): CSSProperties => (
  { width: `calc(${widthPx} * var(--game-scale) * 1px)` }
);

const SubstitutionAtom = (props: SubstitutionAtomProps) => {
  const { attrs, ring, description, font } = props;
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
};

export { SubstitutionAtom };
