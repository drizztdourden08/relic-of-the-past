/* @layer renderer-widgets @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import type { LogsToolbarProps } from '../logs.type';

const LogsToolbar = ({ selectionCount, onCopyAll, onCopySelection, onCopyErrors }: LogsToolbarProps) => (
  <Box className="logs-widget__toolbar">
    <Button size="sm" variant="tertiary" onClick={onCopyAll}>
      Copy everything
    </Button>
    <Button size="sm" variant="tertiary" onClick={onCopySelection} disabled={selectionCount === 0}>
      Copy selection{selectionCount > 0 ? ` (${selectionCount})` : ''}
    </Button>
    <Button size="sm" variant="tertiary" onClick={onCopyErrors}>
      Copy all errors
    </Button>
  </Box>
);

export { LogsToolbar };
