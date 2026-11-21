/* @layer renderer-components @kind component */
import { NodeViewWrapper } from '@tiptap/react';
import { useT } from '@drizztdourden08/brock-react';
import { GlyphChar } from '../GlyphChar';
import type { GlyphAtomProps } from '../TokenAtom.type';

const GlyphAtom = (props: GlyphAtomProps) => {
  const { name, ring, font } = props;
  const t = useT();
  return (
    <NodeViewWrapper
      as="span"
      className={`token-atom token-atom--glyph${ring}`}
      contentEditable={false}
      title={t('language-editor:atom.glyph', { name })}
    >
      <GlyphChar name={name} sheet={font.sheet} metrics={font.metrics} />
    </NodeViewWrapper>
  );
};

export { GlyphAtom };
