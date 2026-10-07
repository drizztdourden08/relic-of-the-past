/* @layer renderer-components @kind component */
/**
 * A labelled set of rows. Not the SettingsSection card: this nests inside
 * itself, and its label is a legend on a real fieldset for form readers.
 */
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { EditorRow } from './EditorRow';
import type { EditorGroupProps } from '../RecordEditor.type';
import '../RecordEditor.css';

const EditorGroup = (props: EditorGroupProps) => {
  const { group, binding, depth } = props;
  return (
    <Box as="fieldset" className="record-editor__group">
      {group.label != null && (
        <Text as="legend" className="record-editor__legend">{group.label}</Text>
      )}
      {group.fields.map((field) => (
        <EditorRow key={field.path} field={field} binding={binding} depth={depth} />
      ))}
    </Box>
  );
};

export { EditorGroup };
