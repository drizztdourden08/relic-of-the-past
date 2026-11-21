/* @layer renderer-components @kind component */
import { Box, Center, EmptyState, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import { useT, useText } from '@drizztdourden08/brock-react';
import { emptyFilesMessage } from './empty-files-message';
import { FileRow } from './FileRow';
import { COLUMNS, NO_USES } from './MsuFilePanel.constants';
import type { FileListProps } from './FileList.type';

const FileList = (props: FileListProps) => {
  const { ready, shown, fileCount, supersededOnly, filter, usage, audition, busy, readOnly, onRename, onDelete } = props;
  const t = useT();
  const text = useText();

  if (!ready) return <Center><Spinner /></Center>;
  if (shown.length === 0) return <EmptyState message={emptyFilesMessage(t, fileCount, supersededOnly, filter)} />;

  return (
    <Box className="msu-file-grid">
      <Box className="msu-file-grid__head" aria-hidden>
        {COLUMNS.map((column) => (
          <Text key={column.id} className="msu-file-grid__label">
            {column.label === null ? '' : text(column.label)}
          </Text>
        ))}
      </Box>

      <Box className="msu-file-grid__body">
        {shown.map((file) => (
          <FileRow
            key={file.name}
            file={file}
            usedBy={usage.get(file.name) ?? NO_USES}
            loopSeconds={audition.loopOf(file.name)}
            playing={audition.playing === file.name}
            loading={audition.loading === file.name}
            audition={audition.playing === file.name ? audition.audition : null}
            busy={busy}
            readOnly={readOnly}
            onPlay={audition.toggle}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </Box>
    </Box>
  );
};

export { FileList };
