/* @layer renderer-widgets @kind component */
/**
 * ConnectionEditorDialog — Wizard for creating/editing connections.
 *
 * Step 1: View existing + detected connections, add/remove/edit
 * Step 2: Preview generated TS code
 */

import { Button, Badge, TextInput } from '../../components/primitives';
import type { ScreenConnection } from '@shared/game/types';
import { CONNECTION_TAG_METADATA } from '@shared/game/data/connections/tags';
import type { DetectedConnection } from './useDatasetStatus';
import { useConnectionEditor } from './useConnectionEditor';
import './ConnectionEditorDialog.css';

interface ConnectionEditorDialogProps {
  open: boolean;
  onClose: () => void;
  /** Current screen ID */
  screenId: string | null;
  /** Screen metadata for file resolution */
  screenMeta: { type: string; dungeon?: string; isDarkWorld: boolean } | null;
  /** Existing connections from the dataset */
  existingConnections: ScreenConnection[];
  /** Detected connections from game state not yet in dataset */
  unmatchedConnections: DetectedConnection[];
}

const ConnectionEditorDialog = (props: ConnectionEditorDialogProps) => {
  const { open, onClose, screenId } = props;
  const {
    step, setStep, connections, editingIdx, setEditingIdx, writing, writeError,
    suggestedConnections, newConnections, generatedCode, targetFile,
    addSuggested, addBlank, removeConnection, updateConnection, toggleTag, handleWrite,
  } = useConnectionEditor(props);

  if (!open) return null;

  return (
    <div className="conn-editor-backdrop" onClick={onClose}>
      <div className="conn-editor" onClick={e => e.stopPropagation()}>
        <div className="conn-editor__header">
          <h3>Edit Connections</h3>
          {screenId && <code className="conn-editor__screen-id">{screenId}</code>}
        </div>

        {/* Step indicator */}
        <div className="conn-editor__steps">
          <button className={step === 0 ? 'active' : ''} onClick={() => setStep(0)}>1. Connections</button>
          <button className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>2. Preview</button>
        </div>

        {/* Step 1: Connection list */}
        {step === 0 && (
          <div className="conn-editor__list">
            {/* Existing connections */}
            {connections.map((conn, idx) => (
              <div key={conn.key} className={`conn-editor__item ${conn.isNew ? 'conn-editor__item--new' : ''}`}>
                <div className="conn-editor__item-header">
                  <span className="conn-editor__item-dir">
                    {conn.from === screenId ? '→' : '←'}
                  </span>
                  {editingIdx === idx ? (
                    <div className="conn-editor__item-edit">
                      <TextInput
                        value={conn.from}
                        onChange={e => updateConnection(idx, { from: e.target.value })}
                        placeholder="from"
                      />
                      <TextInput
                        value={conn.to}
                        onChange={e => updateConnection(idx, { to: e.target.value })}
                        placeholder="to"
                      />
                    </div>
                  ) : (
                    <span className="conn-editor__item-ids" onClick={() => setEditingIdx(idx)}>
                      {conn.from} → {conn.to}
                    </span>
                  )}
                  <div className="conn-editor__item-actions">
                    {conn.isNew && <Badge variant="warning">new</Badge>}
                    <button className="conn-editor__btn-remove" onClick={() => removeConnection(idx)}>×</button>
                  </div>
                </div>
                {editingIdx === idx && (
                  <div className="conn-editor__item-tags">
                    {(['transit', 'barrier', 'dir', 'ctx'] as const).map(ns => (
                      <div key={ns} className="conn-editor__tag-group">
                        <span className="conn-editor__tag-ns">{ns}</span>
                        {CONNECTION_TAG_METADATA.filter(t => t.namespace === ns).map(t => (
                          <button
                            key={t.id}
                            className={`conn-editor__tag ${conn.tags.includes(t.id) ? 'active' : ''}`}
                            onClick={() => toggleTag(idx, t.id)}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {editingIdx !== idx && conn.tags.length > 0 && (
                  <div className="conn-editor__item-tag-summary" onClick={() => setEditingIdx(idx)}>
                    {conn.tags.map(t => t.split(':')[1]).join(', ')}
                  </div>
                )}
              </div>
            ))}

            {/* Suggested (unmatched detected) */}
            {suggestedConnections.length > 0 && (
              <div className="conn-editor__suggested">
                <h4>Detected (not in dataset)</h4>
                {suggestedConnections
                  .filter(s => !connections.some(c => c.from === s.from && c.to === s.to))
                  .map(s => (
                    <div key={s.key} className="conn-editor__suggested-item">
                      <span>{s.from} → {s.to}</span>
                      <span className="conn-editor__suggested-tags">
                        {s.tags.map(t => t.split(':')[1]).join(', ')}
                      </span>
                      <Button variant="secondary" onClick={() => addSuggested(s)}>+ Add</Button>
                    </div>
                  ))}
              </div>
            )}

            <Button variant="secondary" onClick={addBlank}>+ Add Connection</Button>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 1 && (
          <div className="conn-editor__preview">
            {newConnections.length === 0 ? (
              <p className="conn-editor__empty">No new connections to write.</p>
            ) : (
              <>
                <div className="conn-editor__file-target">
                  <span>Target: </span>
                  <code>{targetFile?.relativePath}</code>
                </div>
                <pre className="conn-editor__code">{generatedCode}</pre>
              </>
            )}
            {writeError && <p className="conn-editor__error">{writeError}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="conn-editor__actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {step === 0 && (
            <Button variant="primary" onClick={() => setStep(1)}>Preview →</Button>
          )}
          {step === 1 && (
            <>
              <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
              <Button
                variant="primary"
                onClick={handleWrite}
                disabled={writing || newConnections.length === 0}
              >
                {writing ? 'Writing...' : 'Accept & Write'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { ConnectionEditorDialog };
