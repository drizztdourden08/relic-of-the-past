/* @layer renderer-components @kind component */
import { GlyphNamingGrid } from '@app/compounds/GlyphNamingGrid';
import { useGlyphNaming } from '../behavior/useGlyphNaming';
import { useSetFont } from '../behavior/useSetFont';
import type { LettersPaneProps } from './LettersPane.type';

const LettersPane = (props: LettersPaneProps) => {
  const { set, readOnly, onRename } = props;
  const naming = useGlyphNaming({ set, readOnly, onRename });
  const { sheet } = useSetFont(set?.id ?? null, set?.base, set?.glyphs);

  return (
    <GlyphNamingGrid
      items={naming.glyphs}
      names={naming.names}
      problems={naming.problems}
      tiles={sheet?.tiles ?? null}
      readOnly={readOnly}
      canSave={naming.canSave}
      onNameChange={naming.setName}
      onSave={naming.save}
    />
  );
};

export { LettersPane };
