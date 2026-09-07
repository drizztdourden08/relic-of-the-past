/* @layer renderer-components @kind component */
import { DialogShell } from '@ds/composites/DialogShell';
import { Button, Field, Text, TextInput, Textarea } from '@ds/primitives';
import { useBugReportForm } from './behavior/useBugReportForm';
import { DebugInfoPreview } from './sub-components/DebugInfoPreview';
import type { BugReportDialogProps } from './types';
import './BugReportDialog.css';

const BugReportDialog = (props: BugReportDialogProps) => {
  const { open, onClose, debugReportId = null } = props;
  const form = useBugReportForm(debugReportId);
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
        {debugReportId && form.uploadStatus === 'uploading' && (
          <Text as="p" className="bug-report__upload-status">Attaching the debug report...</Text>
        )}
        {debugReportId && form.uploadStatus === 'error' && (
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
      className="bug-report"
      actions={
        <>
          <Button variant="secondary" onClick={closeForm}>Cancel</Button>
          <Button variant="primary" onClick={form.submit} disabled={!form.canSubmit}>
            {form.status === 'submitting' ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      }
    >
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

      {debugReportId && (
        <Field label="Debug Report">
          <Text as="p" className="bug-report__debug-report-id">
            A debug report ({debugReportId}) is packaged and will upload once you submit.
          </Text>
        </Field>
      )}

      <DebugInfoPreview text={form.debugText} />

      {form.status === 'error' && (
        <Text className="bug-report__status bug-report__status--error">
          Couldn't file the report. Try again in a moment.
        </Text>
      )}
    </DialogShell>
  );
};

export { BugReportDialog };
