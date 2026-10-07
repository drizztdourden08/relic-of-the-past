/* @layer renderer-components @kind component */
/** One row of a log: the gutter, then the indentable tag and message, each classed by its kind. */
import { Box, Text } from '../../../primitives';
import type { LogRow } from '../LogPanel.type';

interface LogLineProps {
  row: LogRow;
}

const LogLine = ({ row }: LogLineProps) => {
  const level = row.indent ?? 0;
  return (
    <Box className="log-panel__row">
      <Text className="log-panel__gutter">{row.gutter}</Text>
      <Box className={`log-panel__content${level > 0 ? ` log-panel__content--lvl${level}` : ''}`}>
        <Text className={`log-panel__tag log-panel__tag--${row.kind}`}>{row.tag}</Text>
        <Text className={`log-panel__msg log-panel__msg--${row.kind}`}>{row.message}</Text>
      </Box>
    </Box>
  );
};

export { LogLine };
export type { LogLineProps };
