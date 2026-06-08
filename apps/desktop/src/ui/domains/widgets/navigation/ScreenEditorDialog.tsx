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

  if (!open) return null;

  return (
    <Box className="screen-editor-backdrop" onClick={onClose}>
      <Box className="screen-editor" onClick={e => e.stopPropagation()}>
        <Box className="screen-editor__header">
          <Text as="h3">{existingScreen ? 'Edit Screen' : 'Create Screen'}</Text>
          <Text className="screen-editor__room-id">
            Room 0x{roomIndex.toString(16).toUpperCase().padStart(roomIndex > 0xFF ? 4 : 2, '0')}
          </Text>
          <Text as="code" className="screen-editor__generated-id">{generatedId}</Text>
          <StatusBadge status={status} interactive onChange={setStatus} />
        </Box>

        {/* Mismatch warnings */}
        {mismatches.length > 0 && (
          <Box className="screen-editor__warnings">
            {mismatches.map((w, i) => <Text as="p" key={i}>{w}</Text>)}
          </Box>
        )}

        {/* Step indicator */}
        <Box className="screen-editor__steps">
          <Box as="button" className={step === 0 ? 'active' : ''} onClick={() => setStep(0)}>1. Fields</Box>
          <Box as="button" className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>2. Preview</Box>
        </Box>

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

        {/* Actions */}
        <Box className="screen-editor__actions">
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
        </Box>
      </Box>
    </Box>
  );
};

export { ScreenEditorDialog };
