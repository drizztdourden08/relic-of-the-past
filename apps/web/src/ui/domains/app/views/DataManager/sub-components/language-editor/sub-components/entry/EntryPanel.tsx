/* @layer renderer-components @kind component */
/**
 * One open entry: its identity, its metadata, the view switch, and whichever of
 * the three views is showing.
 *
 * The frame is the same whatever view is active, which is the point — the
 * metadata is true of the entry rather than of a way of looking at it, so it does
 * not move or reappear as a translator flips between reading, editing and
 * previewing. Only the panel's last slot changes.
 *
 * Presentational: the active view arrives as children, and the only things
 * reported back are a mode change and a close.
 */
import { Box, Card, IconButton, Text } from '@ds/primitives';
import { EntryMetaPanel } from './EntryMetaPanel';
import { ViewModeSwitch } from './ViewModeSwitch';
import type { ReactNode } from 'react';
import type { EntryViewMode } from '../../behavior/useEntryView';
import type { MetaRow } from './entry-meta.model';
import './EntryPanel.css';

type EntryPanelProps = {
  /** `#023`, the same label the closed row shows. */
  idLabel: string;
  /** Who says it, for the header. Empty when the data has no name. */
  who: string;
  metaRows: MetaRow[];
  issues: string[];
  mode: EntryViewMode;
  onModeChange: (mode: EntryViewMode) => void;
  onClose: () => void;
  children: ReactNode;
};

const EntryPanel = (props: EntryPanelProps) => {
  const {
    idLabel, who, metaRows, issues, mode,
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
            onChange={onModeChange}
          />
        </Box>
      </Box>

      <EntryMetaPanel rows={metaRows} issues={issues} />

      <Box className="entry-panel__view">{children}</Box>
    </Card>
  );
};

export { EntryPanel };
export type { EntryPanelProps };
