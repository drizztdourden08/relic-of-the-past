/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { DialogueTab } from './DialogueTab';
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
      <Box className="language-editor__pane">
        <VariablesPane
          variables={editor.variables}
          tab={variablesTab}
          readOnly={readOnly}
          setVariableValue={editor.setVariableValue}
          upsertGlossaryTerm={editor.upsertGlossaryTerm}
          removeGlossaryTerm={editor.removeGlossaryTerm}
        />
      </Box>
    );
  }
  if (tab === 'text') {
    return (
      <Box className="language-editor__pane">
        <TextPane text={text} readOnly={readOnly} />
      </Box>
    );
  }
  return null;
};

export { EditorPanes };
