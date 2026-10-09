/* @layer renderer-components @kind component */
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { DialogueEditor } from '../editor-ui';
import { overflowReason } from './overflow-reason';
import type { EntryEditorProps } from './EntryEditor.type';
import './EntryEditor.css';

const EntryEditor = (props: EntryEditorProps) => {
  const {
    tokens, rows, cfg, glossary, variables, metrics, sheet, structureMode, dirty, readOnly = false,
    onChangeTokens, onSave, onCancel, onChangeStructureMode,
  } = props;

  const blocked = overflowReason(rows);

  return (
    <Box className="entry-editor">
      <DialogueEditor
        tokens={tokens}
        cfg={cfg}
        glossary={glossary}
        variables={variables}
        metrics={metrics}
        sheet={sheet}
        structureMode={structureMode}
        readOnly={readOnly}
        onChange={onChangeTokens}
        onChangeStructureMode={onChangeStructureMode}
      />

      {blocked && (
        <Text className="entry-editor__blocked" variant="caption" role="status">{blocked}</Text>
      )}

      <Box className="entry-editor__actions">
        {!readOnly && <Button size="sm" disabled={Boolean(blocked) || !dirty} onClick={onSave}>Save</Button>}
        <Button variant="ghost" size="sm" onClick={onCancel}>{readOnly ? 'Close' : 'Cancel'}</Button>
      </Box>
    </Box>
  );
};

export { EntryEditor };
