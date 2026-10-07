/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { DialogShell } from '@ds/composites/DialogShell';
import { Button, Field, Text, TextInput, Textarea } from '@ds/primitives';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { githubHandleOf } from '@app/lib/sanctuary/github-handle';
import { CaptureSessionPicker } from '../../compounds/CaptureSessionPicker';
import { ReportingAsLine } from '../../compounds/ReportingAsLine';
import { useBugReportForm } from './behavior/useBugReportForm';
import { useCaptureSessions } from './behavior/useCaptureSessions';
import { DebugInfoPreview } from './sub-components/DebugInfoPreview';
import { ReportFiledPanel } from './sub-components/ReportFiledPanel';
import type { BugReportDialogProps } from './types';
import './BugReportDialog.css';

const BugReportDialog = (props: BugReportDialogProps) => {
  const { open, onClose, profileId } = props;
  // Attaching a debug report only makes sense while logging is on for this profile. The
  // dialog can be reached from several places (the floating button, "Report a bug" in the
  // menu, the updater), and this is the one gate all of them share.
  const allowDebugLogging = useAllowDebugLogging();
  const attachProfileId = allowDebugLogging ? profileId : null;

  const capture = useCaptureSessions(attachProfileId, open);
  const form = useBugReportForm(attachProfileId, capture.selectedSessionKeys);
  const showPicker = attachProfileId != null;
  const showResult = open && form.status === 'done' && form.filed !== null;

  const closeForm = () => {
    onClose();
    form.reset();
  };

  // window.open on an external URL is routed to the system browser by the main process.
  const openAndClose = (url: string) => {
    window.open(url, '_blank');
    closeForm();
  };

  if (showResult && form.filed) {
    const { issueUrl, sanctuaryUrl } = form.filed;
    return (
      <DialogShell
        open={open}
        onClose={closeForm}
        title="Report filed"
        className="bug-report"
        actions={
          <>
            <Button variant="secondary" onClick={closeForm}>Close</Button>
            <Button variant="secondary" onClick={() => openAndClose(sanctuaryUrl)}>See it in the Sanctuary</Button>
            <Button variant="primary" onClick={() => openAndClose(issueUrl)}>Open on GitHub</Button>
          </>
        }
      >
        <ReportFiledPanel
          issueUrl={issueUrl}
          uploadStatus={form.uploadStatus}
          uploadError={form.uploadError}
          onRetryUpload={() => { void form.retryUpload(); }}
        />
      </DialogShell>
    );
  }

  return (
    <DialogShell
      open={open}
      onClose={closeForm}
      title="Report a bug"
      className={`bug-report${showPicker ? ' bug-report--with-capture' : ''}`}
      actions={
        <>
          <Button variant="secondary" onClick={closeForm}>Cancel</Button>
          <Button variant="primary" onClick={form.submit} disabled={!form.canSubmit}>
            {form.status === 'submitting' ? 'Sending...' : 'Send report'}
          </Button>
        </>
      }
    >
      <Box className="bug-report__body">
        <Box className="bug-report__form">
          {form.me ? (
            <ReportingAsLine displayName={form.me.user.displayName} githubHandle={githubHandleOf(form.me.identities)} />
          ) : (
            <Field label="Email" required error={form.emailTouched && !form.emailValid ? 'Enter a valid email' : undefined}>
              <TextInput
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
              />
            </Field>
          )}

          <Field label="Subject" required hint="Prefilled from the running game, editable">
            <TextInput
              value={form.subject}
              onChange={(e) => form.setSubject(e.target.value)}
            />
          </Field>

          <Field label="Description" required>
            <Textarea
              rows={5}
              placeholder="What happened, and what you expected"
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
            />
          </Field>

          <DebugInfoPreview text={form.debugText} />

          {form.status === 'error' && (
            <Text className="bug-report__status bug-report__status--error">
              Couldn't file the report{form.submitError ? `: ${form.submitError}` : ''}. Try again in a moment.
            </Text>
          )}
        </Box>

        {showPicker && (
          <>
            <Box className="bug-report__divider" />
            <CaptureSessionPicker
              sessions={capture.sessions}
              loading={capture.loading}
              selected={capture.selected}
              showSent={capture.showSent}
              deleteError={capture.deleteError}
              onToggleSession={capture.toggleSession}
              onToggleShowSent={capture.toggleShowSent}
              onDeleteSession={capture.deleteSession}
            />
          </>
        )}
      </Box>
    </DialogShell>
  );
};

export { BugReportDialog };
