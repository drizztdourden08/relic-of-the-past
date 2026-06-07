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

import { Button, StatusBadge } from '../../components/primitives';
import { useScreenEditor } from './screen-editor/useScreenEditor';
import { ScreenEditorFieldsTop } from './screen-editor/ScreenEditorFieldsTop';
import { ScreenEditorFieldsBottom } from './screen-editor/ScreenEditorFieldsBottom';
import type { ScreenEditorProps } from './screen-editor/types';
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
    <div className="screen-editor-backdrop" onClick={onClose}>
      <div className="screen-editor" onClick={e => e.stopPropagation()}>
        <div className="screen-editor__header">
          <h3>{existingScreen ? 'Edit Screen' : 'Create Screen'}</h3>
          <span className="screen-editor__room-id">
            Room 0x{roomIndex.toString(16).toUpperCase().padStart(roomIndex > 0xFF ? 4 : 2, '0')}
          </span>
          <code className="screen-editor__generated-id">{generatedId}</code>
          <StatusBadge status={status} interactive onChange={setStatus} />
        </div>

        {/* Mismatch warnings */}
        {mismatches.length > 0 && (
          <div className="screen-editor__warnings">
            {mismatches.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}

        {/* Step indicator */}
        <div className="screen-editor__steps">
          <button className={step === 0 ? 'active' : ''} onClick={() => setStep(0)}>1. Fields</button>
          <button className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>2. Preview</button>
        </div>

        {/* Step 1: Fields */}
        {step === 0 && (
          <div className="screen-editor__form">
            <ScreenEditorFieldsTop editor={editor} />
            <ScreenEditorFieldsBottom editor={editor} />
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 1 && (
          <div className="screen-editor__preview">
            <div className="screen-editor__file-target">
              <span>Target: </span>
              <code>{targetFile.relativePath}</code>
            </div>
            <pre className="screen-editor__code">{generatedCode}</pre>
            {writeError && <p className="screen-editor__error">{writeError}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="screen-editor__actions">
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
        </div>
      </div>
    </div>
  );
};

export { ScreenEditorDialog };
