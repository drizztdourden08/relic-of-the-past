/* @layer renderer-components @kind component */
import { Box, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import type { FileNameCellProps } from './FileNameCell.type';

const FileNameCell = (props: FileNameCellProps) => {
  const { name, busy, readOnly, rename } = props;
  const { editing, setEditing, draft, setDraft, handleBlur, handleKeyDown } = rename;

  if (editing) {
    return (
      <Box className="msu-file-row__edit">
        <TextInput
          type="text"
          value={draft}
          aria-label={`Name of ${name}`}
          autoFocus
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </Box>
    );
  }
  return (
    <Text
      className="msu-file-row__name"
      title={readOnly ? name : `${name} (click to rename)`}
      onClick={readOnly ? undefined : () => setEditing(true)}
    >
      {name}
    </Text>
  );
};

export { FileNameCell };
