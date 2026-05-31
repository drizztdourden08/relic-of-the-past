/**
 * ConnectionEditorDialog — Wizard for creating/editing connections.
 *
 * Step 1: View existing + detected connections, add/remove/edit
 * Step 2: Preview generated TS code
 */

import { useState, useMemo, useEffect } from 'react';
import { Button, Badge, TextInput, Select } from '../../components/primitives';
import type { SelectOption } from '../../components/primitives';
import type { ScreenConnection } from '@shared/game/types';
import type { ConnectionTag } from '@shared/game/data/connections/tags';
import { CONNECTION_TAG_METADATA } from '@shared/game/data/connections/tags';
import { serializeConnection, resolveConnectionFile } from '@shared/game/data/screen-codegen';
import type { ConnectionCodegenInput } from '@shared/game/data/screen-codegen';
import type { DetectedConnection } from './useDatasetStatus';
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

interface EditableConnection {
  key: string;
  from: string;
  to: string;
  tags: ConnectionTag[];
  isNew: boolean;
}

function ConnectionEditorDialog({
  open, onClose, screenId, screenMeta,
  existingConnections, unmatchedConnections,
}: ConnectionEditorDialogProps) {
  const [step, setStep] = useState(0);
  const [connections, setConnections] = useState<EditableConnection[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  // Initialize on open
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setWriteError(null);
    setEditingIdx(null);

    const existing: EditableConnection[] = existingConnections.map((c, i) => ({
      key: `existing-${i}`,
      from: c.from,
      to: c.to,
      tags: [...c.tags],
      isNew: false,
    }));

    setConnections(existing);
  }, [open, existingConnections]);

  // New connections to add (from detected unmatched)
  const suggestedConnections = useMemo((): EditableConnection[] => {
    if (!screenId) return [];
    return unmatchedConnections.map((det, i) => {
      const tags: ConnectionTag[] = [];
      // Infer tags from detection type
      if (det.type === 'entrance') {
        tags.push('transit:door', 'dir:two-way', 'ctx:entrance');
      } else if (det.type === 'stair') {
        tags.push('transit:stairs', 'dir:two-way', 'ctx:internal');
      } else {
        tags.push('transit:walk', 'dir:two-way', 'ctx:internal');
      }

      // Build a suggested screen ID for the target
      const targetHex = det.targetRoomOrScreen.toString(16).padStart(2, '0');
      const suggestedTo = det.type === 'entrance'
        ? `lw-${targetHex}` // overworld screen
        : `room-0x${targetHex}`; // indoor room

      return {
        key: `suggested-${i}`,
        from: screenId,
        to: suggestedTo,
        tags,
        isNew: true,
      };
    });
  }, [screenId, unmatchedConnections]);

  const addSuggested = (suggested: EditableConnection) => {
    setConnections(prev => [...prev, { ...suggested, key: `added-${Date.now()}-${Math.random()}` }]);
  };

  const addBlank = () => {
    setConnections(prev => [...prev, {
      key: `new-${Date.now()}`,
      from: screenId ?? '',
      to: '',
      tags: ['transit:door', 'dir:two-way'],
      isNew: true,
    }]);
    setEditingIdx(connections.length);
  };

  const removeConnection = (idx: number) => {
    setConnections(prev => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const updateConnection = (idx: number, patch: Partial<EditableConnection>) => {
    setConnections(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const toggleTag = (idx: number, tag: ConnectionTag) => {
    const conn = connections[idx];
    const tags = conn.tags.includes(tag)
      ? conn.tags.filter(t => t !== tag)
      : [...conn.tags, tag];
    updateConnection(idx, { tags });
  };

  // Generate code for new connections only
  const newConnections = connections.filter(c => c.isNew);
  const generatedCode = useMemo(
    () => newConnections.map(c => serializeConnection(c)).join('\n'),
    [newConnections],
  );

  const targetFile = useMemo(() => {
    if (!screenMeta || newConnections.length === 0) return null;
    return resolveConnectionFile(
      newConnections[0],
      screenMeta.type,
      screenMeta.dungeon,
      screenMeta.isDarkWorld ? 'dark' : 'light',
    );
  }, [newConnections, screenMeta]);

  const handleWrite = async () => {
    if (!targetFile || !generatedCode) return;
    setWriting(true);
    setWriteError(null);
    try {
      const result = await window.api.screenEditor.writeConnections({
        filePath: targetFile.relativePath,
        code: generatedCode,
      });
      if (!result.success) {
        setWriteError(result.error ?? 'Unknown error');
      } else {
        onClose();
      }
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

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
                        onChange={v => updateConnection(idx, { from: v })}
                        placeholder="from"
                      />
                      <TextInput
                        value={conn.to}
                        onChange={v => updateConnection(idx, { to: v })}
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
}

export { ConnectionEditorDialog };
