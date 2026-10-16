/* @layer renderer-app @kind component */
import { useState } from 'react';
import { Callout, EmptyState, Grid, Inline, ScrollArea, Stack, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { RecordingCard } from '@app/compounds/RecordingCard';
import { useRecordings } from '../behavior/useRecordings';
import {
  DELETE_LABEL, DELETE_MESSAGE, DELETE_TITLE, NONE_MESSAGE, NONE_NEW_MESSAGE, SHOW_SENT_LABEL, TITLE,
} from '../BugReportRecordings.constants';
import type { RecordingsPickerProps } from './RecordingsPicker.type';

const RecordingsPicker = (props: RecordingsPickerProps) => {
  const { profileId, setExtras, disabled } = props;
  const { sessions, loading, selected, showSent, error, toggleSession, toggleShowSent, deleteSession } = useRecordings(profileId, setExtras);
  const [pending, setPending] = useState<string | null>(null);

  const confirmDelete = (): void => {
    if (pending !== null) deleteSession(pending);
    setPending(null);
  };

  return (
    <Stack gap="sm" className="bug-report-recordings">
      <Inline justify="between" align="center">
        <Text variant="label">{TITLE}</Text>
        <Toggle checked={showSent} onChange={toggleShowSent} label={SHOW_SENT_LABEL} disabled={disabled} />
      </Inline>
      {error !== null && <Callout tone="danger">{error}</Callout>}
      {sessions.length === 0 && !loading ? (
        <EmptyState message={showSent ? NONE_MESSAGE : NONE_NEW_MESSAGE} />
      ) : (
        <ScrollArea className="bug-report-recordings__list">
          <Grid columns={2} gap="md">
            {sessions.map((session) => (
              <RecordingCard
                key={session.sessionKey}
                session={session}
                checked={selected.has(session.sessionKey)}
                disabled={disabled}
                onToggle={toggleSession}
                onDelete={setPending}
              />
            ))}
          </Grid>
        </ScrollArea>
      )}
      <Dialog
        open={pending !== null}
        title={DELETE_TITLE}
        message={DELETE_MESSAGE}
        confirmLabel={DELETE_LABEL}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </Stack>
  );
};

export { RecordingsPicker };
