/* @layer renderer-components @kind component */
import { atomFactsOf } from './atom-facts';
import { GlyphAtom } from './sub-components/GlyphAtom';
import { PlainAtom } from './sub-components/PlainAtom';
import { SubstitutionAtom } from './sub-components/SubstitutionAtom';
import type { DialogueTokenAttrs } from './editor-contract';
import type { TokenAtomProps } from './TokenAtom.type';
import './TokenAtom.css';

const TokenAtom = (props: TokenAtomProps) => {
  const { node, selected, glyphNames, font } = props;

  const attrs = node.attrs as DialogueTokenAttrs;
  const facts = atomFactsOf(attrs);
  const { name } = facts;
  const ring = selected ? ' token-atom--selected' : '';

  if (attrs.kind === 'cmd' && name !== null && glyphNames.has(name)) {
    return <GlyphAtom name={name} ring={ring} font={font} />;
  }
  if (attrs.kind === 'var') {
    return <SubstitutionAtom attrs={attrs} ring={ring} description={facts.description} font={font} />;
  }
  return <PlainAtom attrs={attrs} facts={facts} ring={ring} />;
};

export { TokenAtom };
