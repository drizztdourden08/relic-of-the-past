/* @layer renderer-components @kind component */
import { Box, Card, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { EntryMetaPanel } from './EntryMetaPanel';
import { ViewModeSwitch } from './ViewModeSwitch';
import type { EntryPanelProps } from './entry.type';
import './EntryPanel.css';

const EntryPanel = (props: EntryPanelProps) => {
  const {
    idLabel, who, metaRows, issues, mode, modes,
    onModeChange, onClose, children,
  } = props;

  return (
    <Card className="entry-panel">
      <Box className="entry-panel__head">
        <IconButton
          variant="ghost"
          size="sm"
          label={`Close ${idLabel}`}
          className="entry-panel__collapse"
          onClick={onClose}
        >
          ▾
        </IconButton>
        <Text as="span" className="entry-panel__id">{idLabel}</Text>
        {who ? <Text as="span" className="entry-panel__who">{who}</Text> : null}
        <Box className="entry-panel__modes">
          <ViewModeSwitch
            value={mode}
            modes={modes}
            onChange={onModeChange}
          />
        </Box>
      </Box>

      {metaRows !== null && <EntryMetaPanel rows={metaRows} issues={issues} />}

      <Box className="entry-panel__view">{children}</Box>
    </Card>
  );
};

export { EntryPanel };
