/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { DialogShell } from '@ds/composites/DialogShell';
import { Button, Field, Text, TextInput, Textarea } from '@ds/primitives';
import { useAllowDebugLogging } from '@app/lib/diagnostics/useAllowDebugLogging';
import { CaptureSessionPicker } from '../../compounds/CaptureSessionPicker';
import { useBugReportForm } from './behavior/useBugReportForm';
import { useCaptureSessions } from './behavior/useCaptureSessions';
import { DebugInfoPreview } from './sub-components/DebugInfoPreview';
import type { BugReportDialogProps } from './types';
import './BugReportDialog.css';

const BugReportDialog = (props: BugReportDialogProps) => {
  const { open, onClose, profileId } = props;
  // Attaching a debug report only makes sense while logging is on for this profile - the
  // dialog can be reached from several places (the floating button, "Report a bug" in the
  // menu, the updater), and this is the one gate all of them share.
  const allowDebugLogging = useAllowDebugLogging();
  const attachProfileId = allowDebugLogging ? profileId : null;

  const capture = useCaptureSessions(attachProfileId, open);
  const form = useBugReportForm(attachProfileId, capture.selectedSessionKeys);
  const showPicker = attachProfileId != null;
  const showResult = open && form.status === 'done' && form.resultUrl !== null;

  const closeForm = () => {
    onClose();
    form.reset();
  };

  const openOnGithub = () => {
    if (form.resultUrl) window.open(form.resultUrl, '_blank');
    closeForm();
  };

  if (showResult) {
    return (
      <DialogShell
        open={open}
        onClose={closeForm}
        title="Report filed"
        className="bug-report"
        actions={
          <>
            <Button variant="secondary" onClick={closeForm}>Close</Button>
            <Button variant="primary" onClick={openOnGithub}>Open on GitHub</Button>
          </>
        }
      >
        <Text as="p">Thanks! Your report was filed.</Text>
        <Text as="p" className="bug-report__result-url">{form.resultUrl}</Text>
        {form.reportId && form.uploadStatus === 'uploading' && (
          <Text as="p" className="bug-report__upload-status">Attaching the debug report...</Text>
        )}
        {form.reportId && form.uploadStatus === 'error' && (
          <>
            <Text as="p" className="bug-report__status bug-report__status--error">
              Couldn't attach the debug report{form.uploadError ? `: ${form.uploadError}` : ''}.
            </Text>
            <Button variant="secondary" onClick={form.retryUpload}>Retry upload</Button>
          </>
        )}
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
            {form.status === 'submitting' ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      }
    >
      <Box className="bug-report__body">
        <Box className="bug-report__form">
          <Field label="Email" required error={form.emailTouched && !form.emailValid ? 'Enter a valid email' : undefined}>
            <TextInput
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => form.setEmail(e.target.value)}
            />
          </Field>

          <Field label="Subject" required>
            <TextInput
              placeholder="Short summary of the problem"
              value={form.subject}
              onChange={(e) => form.setSubject(e.target.value)}
            />
          </Field>

          <Field label="Description" required>
            <Textarea
              rows={5}
              placeholder="What happened? What did you expect instead?"
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
            />
          </Field>

          <DebugInfoPreview text={form.debugText} />

          {form.attachError && (
            <Text className="bug-report__status bug-report__status--error">
              Couldn't attach the debug report ({form.attachError}) - filing without it.
            </Text>
          )}

          {form.status === 'error' && (
            <Text className="bug-report__status bug-report__status--error">
              Couldn't file the report. Try again in a moment.
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
