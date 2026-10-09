/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Text, Toggle, EmptyState, ScrollArea } from '@drizztdourden08/tessera/primitives';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { CaptureSessionRow } from './sub-components/CaptureSessionRow';
import type { CaptureSessionPickerProps } from './CaptureSessionPicker.type';
import './CaptureSessionPicker.css';

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
