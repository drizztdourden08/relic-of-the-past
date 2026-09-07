/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Toggle } from '@ds/primitives/Toggle';
import { EmptyState } from '@ds/primitives/EmptyState';
import { ScrollArea } from '@ds/primitives/ScrollArea';
import { Dialog } from '@ds/composites/Dialog';
import { CaptureSessionRow } from './sub-components/CaptureSessionRow';
import type { CaptureSessionPickerProps } from './CaptureSessionPicker.type';
import './CaptureSessionPicker.css';

/** The bug-report dialog's right-hand pane: every recorded capture session, checkable and
 *  deletable. Bare tier - listing/selection/deletion all happen a level up (useCaptureSessions,
 *  a view-level hook), this only renders what it's handed and arms a delete confirmation
 *  before calling back. */
const CaptureSessionPicker = (props: CaptureSessionPickerProps) => {
  const { sessions, loading, selected, showSent, deleteError, onToggleSession, onToggleShowSent, onDeleteSession } = props;
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (pendingDelete) onDeleteSession(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <Box className="capture-session-picker">
      <Box className="capture-session-picker__header">
        <Text className="capture-session-picker__title">Recordings to include</Text>
        <Toggle checked={showSent} onChange={onToggleShowSent} label="Show sent" />
      </Box>

      {deleteError && <Text className="capture-session-picker__error">{deleteError}</Text>}

      {sessions.length === 0 && !loading ? (
        <EmptyState message={showSent ? 'No recordings yet.' : 'No new recordings - toggle "Show sent" to see earlier ones.'} />
      ) : (
        <ScrollArea className="capture-session-picker__list">
          {sessions.map((session) => (
            <CaptureSessionRow
              key={session.sessionKey}
              session={session}
              checked={selected.has(session.sessionKey)}
              onToggle={onToggleSession}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </ScrollArea>
      )}

      <Dialog
        open={pendingDelete != null}
        title="Delete this recording?"
        message="This removes its frames and video from disk for good. It won't be included in any report."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Box>
  );
};

export { CaptureSessionPicker };
