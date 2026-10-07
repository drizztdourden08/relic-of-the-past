/* @layer renderer-components @kind component */
/**
 * A few log rows with no toolbar, window or scroller: the panel's own row in a
 * plain list, for a short excerpt such as the last moments of a run. Colour
 * works as in the panel: the caller's scoping class styles its kind slugs.
 */
import { Box } from '../../../primitives';
import { LogLine } from './LogLine';
import type { LogRow } from '../LogPanel.type';

interface LogLinesProps {
  rows: readonly LogRow[];
  /** Scoping class for the caller's own kind palette. */
  className?: string;
}

const LogLines = ({ rows, className = '' }: LogLinesProps) => (
  <Box className={`log-panel__lines${className ? ` ${className}` : ''}`}>
    {rows.map((row) => <LogLine key={row.id} row={row} />)}
  </Box>
);

export { LogLines };
export type { LogLinesProps };
