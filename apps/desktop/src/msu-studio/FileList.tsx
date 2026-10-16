/* @layer renderer-components @kind component */
import { Box, Center, EmptyState, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import { emptyFilesMessage } from './empty-files-message';
import { FileRow } from './FileRow';
import { COLUMNS, NO_USES } from './MsuFilePanel.constants';
import type { FileListProps } from './FileList.type';

const FileList = (props: FileListProps) => {
  const { ready, shown, fileCount, supersededOnly, filter, usage, audition, busy, readOnly, onRename, onDelete } = props;

  if (!ready) return <Center><Spinner /></Center>;
  if (shown.length === 0) return <EmptyState message={emptyFilesMessage(fileCount, supersededOnly, filter)} />;

  return (
    <Box className="msu-file-grid">
      <Box className="msu-file-grid__head" aria-hidden>
        {COLUMNS.map((label, index) => (
          <Text key={label === '' ? `actions-${index}` : label} className="msu-file-grid__label">
            {label}
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
