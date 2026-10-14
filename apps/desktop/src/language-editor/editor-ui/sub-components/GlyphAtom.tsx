/* @layer renderer-components @kind component */
import { NodeViewWrapper } from '@tiptap/react';
import { GlyphChar } from '../GlyphChar';
import type { GlyphAtomProps } from '../TokenAtom.type';

const GlyphAtom = (props: GlyphAtomProps) => {
  const { name, ring, font } = props;
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
};

export { GlyphAtom };
