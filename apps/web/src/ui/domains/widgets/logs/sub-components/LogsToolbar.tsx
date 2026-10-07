/* @layer renderer-widgets @kind component */
/** Copy actions for the logs widget: everything, the current line selection, or errors only. */
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';

interface LogsToolbarProps {
  selectionCount: number;
  onCopyAll: () => void;
  onCopySelection: () => void;
  onCopyErrors: () => void;
}

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
