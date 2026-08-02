/* @layer renderer-components @kind component */
/**
 * A labelled set of rows.
 *
 * Purpose-built rather than the SettingsSection composite. That one lays out a
 * settings page: a titled card whose every direct child gets its own padding and
 * a divider between them. This has to nest inside itself — an object field opens
 * a group inside a group inside a group — and its label is a legend on a real
 * fieldset so a form reader announces the group a control belongs to. Borrowing
 * the card would have meant fighting both, so it stays a thin wrapper.
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
