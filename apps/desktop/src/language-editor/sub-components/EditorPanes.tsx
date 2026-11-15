/* @layer renderer-components @kind component */
import { DialogueTab } from './DialogueTab';
import { LettersPane } from './LettersPane';
import { TextPane } from './TextPane';
import { VariablesPane } from './VariablesPane';
import type { EditorPanesProps } from './EditorPanes.type';

const EditorPanes = (props: EditorPanesProps) => {
  const { tab, readOnly, editor, dialogue, variablesTab, text } = props;

  if (tab === 'dialogue') {
    return <DialogueTab {...dialogue} readOnly={readOnly} onChangeStructureMode={editor.setStructureMode} />;
  }
  if (tab === 'variables') {
    return (
      <VariablesPane
        variables={editor.variables}
        tab={variablesTab}
        readOnly={readOnly}
        setVariableValue={editor.setVariableValue}
        upsertGlossaryTerm={editor.upsertGlossaryTerm}
        removeGlossaryTerm={editor.removeGlossaryTerm}
      />
    );
  }
  if (tab === 'text') {
    return <TextPane text={text} readOnly={readOnly} />;
  }
  if (tab === 'letters') {
    return <LettersPane set={editor.set} readOnly={readOnly} onRename={editor.renameGlyphs} />;
  }
  return null;
};

export { EditorPanes };
