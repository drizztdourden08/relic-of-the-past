/* @layer renderer-widgets @kind component */
/**
 * ScreenEditorDialog — Wizard for creating/editing screen definitions.
 *
 * Step 1: Edit screen fields (pre-filled from game state + existing data)
 * Step 2: Preview generated TS code
 *
 * Field derivation, form state, and codegen live in ./screen-editor/* — this is
 * the dialog shell (chrome, step routing, actions).
 */

import { Box, Text, Button, StatusBadge } from '../../../design-system/primitives';
import { WizardDialogShell } from '../../../design-system/composites/WizardDialogShell';
import { useScreenEditor } from './screen-editor/useScreenEditor';
import { ScreenEditorFieldsTop } from './screen-editor/ScreenEditorFieldsTop';
import { ScreenEditorFieldsBottom } from './screen-editor/ScreenEditorFieldsBottom';
import type { ScreenEditorProps } from './screen-editor/screen-editor.type';
import './ScreenEditorDialog.css';

const ScreenEditorDialog = (props: ScreenEditorProps) => {
  const { open, onClose, existingScreen } = props;
  const editor = useScreenEditor(props);
  const {
    step, setStep, mismatches, generatedId, roomIndex, status, setStatus,
    writing, writeError, generatedCode, targetFile, handleWrite,
  } = editor;

  const headerExtra = (
    <>
      <Text className="screen-editor__room-id">
        Room 0x{roomIndex.toString(16).toUpperCase().padStart(roomIndex > 0xFF ? 4 : 2, '0')}
      </Text>
      <Text as="code" className="screen-editor__generated-id">{generatedId}</Text>
      <StatusBadge status={status} interactive onChange={setStatus} />
    </>
  );

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      {step === 0 && (
        <Button variant="primary" onClick={() => setStep(1)}>Preview →</Button>
      )}
      {step === 1 && (
        <>
          <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
          <Button variant="primary" onClick={handleWrite} disabled={writing}>
            {writing ? 'Writing...' : 'Accept & Write'}
          </Button>
        </>
      )}
    </>
  );

  return (
    <WizardDialogShell
      open={open}
      onClose={onClose}
      title={existingScreen ? 'Edit Screen' : 'Create Screen'}
      headerExtra={headerExtra}
      steps={[{ label: 'Fields' }, { label: 'Preview' }]}
      activeStep={step}
      onStepChange={setStep}
      actions={actions}
      className="screen-editor"
    >
      {/* Mismatch warnings */}
      {mismatches.length > 0 && (
        <Box className="screen-editor__warnings">
          {mismatches.map((w, i) => <Text as="p" key={i}>{w}</Text>)}
        </Box>
      )}

      {/* Step 1: Fields */}
      {step === 0 && (
        <Box className="screen-editor__form">
          <ScreenEditorFieldsTop editor={editor} />
          <ScreenEditorFieldsBottom editor={editor} />
        </Box>
      )}

      {/* Step 2: Preview */}
      {step === 1 && (
        <Box className="screen-editor__preview">
          <Box className="screen-editor__file-target">
            <Text>Target: </Text>
            <Text as="code">{targetFile.relativePath}</Text>
          </Box>
          <Box as="pre" className="screen-editor__code">{generatedCode}</Box>
          {writeError && <Text as="p" className="screen-editor__error">{writeError}</Text>}
        </Box>
      )}
    </WizardDialogShell>
  );
};

export { ScreenEditorDialog };
