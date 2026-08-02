/* @layer renderer-widgets @kind component */
/**
 * ConnectionEditorDialog — Wizard for creating/editing connections.
 *
 * Step 1: View existing + detected connections, add/remove/edit
 * Step 2: Preview generated TS code
 *
 * NOTE: shares its backdrop/header/step-indicator/actions shape with
 * ScreenEditorDialog — a future `WizardDialogShell` could unify both.
 */

import { Box, Text, Button, Badge, TextInput } from '../../../design-system/primitives';
import { WizardDialogShell } from '../../../design-system/composites/WizardDialogShell';
import { CONNECTION_TAG_METADATA, CONNECTION_TAG_NAMESPACES } from '@shared/game/data';
import { useConnectionEditor } from './useConnectionEditor';
import type { ConnectionEditorParams } from './useConnectionEditor';
import { connectionIssues } from './connection-issues';
import { ConnectionEndpoints } from './ConnectionEndpoints';
import { ConnectionIssues } from './ConnectionIssues';
import './ConnectionEditorDialog.css';

type ConnectionEditorDialogProps = ConnectionEditorParams;

const ConnectionEditorDialog = (props: ConnectionEditorDialogProps) => {
  const { open, onClose, screenId } = props;
  const {
    step, setStep, connections, editingIdx, setEditingIdx, writing, writeError,
    suggestedConnections, newConnections, generatedCode, targetFile, tileDescriptions,
    unresolved, canWrite, addSuggested, addBlank, removeConnection, updateConnection, toggleTag, handleWrite,
  } = useConnectionEditor(props);

  const headerExtra = screenId
    ? <Text as="code" className="conn-editor__screen-id">{screenId}</Text>
    : null;

  const actions = (
    <>
      <Button variant="tertiary" onClick={onClose}>Cancel</Button>
      {step === 0 && (
        <Button variant="primary" onClick={() => setStep(1)}>Preview →</Button>
      )}
      {step === 1 && (
        <>
          <Button variant="tertiary" onClick={() => setStep(0)}>← Back</Button>
          <Button
            variant="primary"
            onClick={handleWrite}
            disabled={writing || !canWrite}
          >
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
      title="Edit Connections"
      headerExtra={headerExtra}
      steps={[{ label: 'Connections' }, { label: 'Preview' }]}
      activeStep={step}
      onStepChange={setStep}
      actions={actions}
      className="conn-editor"
    >
        {/* Step 1: Connection list */}
        {step === 0 && (
          <Box className="conn-editor__list">
            {/* Existing connections */}
            {connections.map((conn, idx) => (
              <Box key={conn.key} className={`conn-editor__item ${conn.isNew ? 'conn-editor__item--new' : ''}`}>
                <Box className="conn-editor__item-header">
                  <Text className="conn-editor__item-dir">
                    {conn.from === screenId ? '→' : '←'}
                  </Text>
                  {editingIdx === idx ? (
                    <Box className="conn-editor__item-edit">
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
                    </Box>
                  ) : (
                    <Box className="conn-editor__item-ids" onClick={() => setEditingIdx(idx)}>
                      <ConnectionEndpoints from={conn.from} to={conn.to} />
                    </Box>
                  )}
                  <Box className="conn-editor__item-actions">
                    {conn.isNew && <Badge variant="warning">new</Badge>}
                    <Button variant="bare" className="conn-editor__btn-remove" onClick={() => removeConnection(idx)}>×</Button>
                  </Box>
                </Box>
                {editingIdx === idx && (
                  <Box className="conn-editor__item-edit-hint">
                    <ConnectionEndpoints from={conn.from} to={conn.to} />
                  </Box>
                )}
                {editingIdx === idx && (
                  <Box className="conn-editor__item-tags">
                    {CONNECTION_TAG_NAMESPACES.map(ns => (
                      <Box key={ns.id} className="conn-editor__tag-group">
                        <Text className="conn-editor__tag-ns">{ns.label}</Text>
                        {CONNECTION_TAG_METADATA.filter(t => t.namespace === ns.id).map(t => (
                          <Button
                            variant="bare"
                            key={t.id}
                            className={`conn-editor__tag ${conn.tags.includes(t.id) ? 'active' : ''}`}
                            onClick={() => toggleTag(idx, t.id)}
                          >
                            {t.label}
                          </Button>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )}
                {editingIdx !== idx && conn.tags.length > 0 && (
                  <Box className="conn-editor__item-tag-summary" onClick={() => setEditingIdx(idx)}>
                    {conn.tags.map(t => t.split(':')[1]).join(', ')}
                  </Box>
                )}
                {tileDescriptions[conn.key] && (
                  <Text className="conn-editor__item-tiles">{tileDescriptions[conn.key]}</Text>
                )}
                <ConnectionIssues issues={connectionIssues(conn, tileDescriptions[conn.key] ?? null)} />
              </Box>
            ))}

            {/* Suggested (unmatched detected) */}
            {suggestedConnections.length > 0 && (
              <Box className="conn-editor__suggested">
                <Text as="h4">Detected (not in dataset)</Text>
                {suggestedConnections
                  .filter(s => !connections.some(c => c.from === s.from && c.to === s.to))
                  .map(s => (
                    <Box key={s.key} className="conn-editor__suggested-item">
                      <ConnectionEndpoints from={s.from} to={s.to} />
                      <Text className="conn-editor__suggested-tags">
                        {s.tags.map(t => t.split(':')[1]).join(', ')}
                      </Text>
                      <Button variant="tertiary" onClick={() => addSuggested(s)}>+ Add</Button>
                    </Box>
                  ))}
              </Box>
            )}

            <Button variant="tertiary" onClick={addBlank}>+ Add Connection</Button>
          </Box>
        )}

        {/* Step 2: Preview */}
        {step === 1 && (
          <Box className="conn-editor__preview">
            {newConnections.length === 0 ? (
              <Text as="p" className="conn-editor__empty">No new connections to write.</Text>
            ) : (
              <>
                <Box className="conn-editor__file-target">
                  <Text>Target: </Text>
                  <Text as="code">{targetFile?.relativePath ?? `unresolved — ${targetFile?.unresolved ?? 'no destination'}`}</Text>
                </Box>
                <Box as="pre" className="conn-editor__code">{generatedCode}</Box>
                {unresolved.map(u => (
                  <Text as="p" key={u} className="conn-editor__error">
                    {u} — both endpoints must name a screen in the dataset before this can be written.
                  </Text>
                ))}
              </>
            )}
            {writeError && <Text as="p" className="conn-editor__error">{writeError}</Text>}
          </Box>
        )}
    </WizardDialogShell>
  );
};

export { ConnectionEditorDialog };
