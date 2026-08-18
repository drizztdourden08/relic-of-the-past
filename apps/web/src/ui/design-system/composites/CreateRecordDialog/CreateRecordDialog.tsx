/* @layer renderer-components @kind component */
/**
 * A brand-new record, filled in with the same field-kit rendering machinery
 * `RecordEditor` uses to edit one — `EditorGroup`/`EditorRow` recurse through
 * the schema exactly as they do there, so a dropdown, an idRef picker or a
 * requirement editor looks and behaves identically whether the record already
 * exists or is being created right now.
 *
 * What differs from `RecordEditor` is the gate on the submit button: there is
 * no baseline to compare against (nothing has been "changed" yet), so the
 * button unlocks once every required path holds a value instead of once
 * anything is dirty.
 */
import { useCallback, useMemo, useRef } from 'react';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Text } from '../../primitives/Text';
import { getPath } from '../../data/schema/path';
import { DialogShell } from '../DialogShell';
import { EditorGroup, layoutGroups } from '../RecordEditor';
import { useCreateFormState } from './behavior/use-create-form-state';
import type { EditorBinding } from '../RecordEditor';
import type { IdRefOptionResolver } from '../field-kits/registry';
import type { CreateRecordDialogProps } from './CreateRecordDialog.type';
import './CreateRecordDialog.css';

const CANCEL = 'Cancel';
const CREATE = 'Create';
const CREATING = 'Creating…';
const NO_FIELDS = 'This record has no fields to fill in.';
const NOT_DIRTY = () => false;

const CreateRecordDialog = (props: CreateRecordDialogProps) => {
  const {
    open, title, schema, config, initialRecord, requiredPaths,
    resolveIdRefOptions, resolveTagSuggestions, onCreateTag, resolveNumberBounds,
    onCreate, onCreated, onCancel,
  } = props;
  const {
    working, setValue, isComplete, saving, error, handleCreate,
  } = useCreateFormState({
    initialRecord, requiredPaths, open, onCreate,
  });
  const createRef = useRef<HTMLButtonElement>(null);

  const groups = useMemo(() => layoutGroups(schema, config), [schema, config]);
  const readValue = useCallback((path: string) => getPath(working, path), [working]);
  const readBounds = useCallback(
    (path: string) => resolveNumberBounds?.(path, working),
    [resolveNumberBounds, working],
  );

  // Same handoff the record editor makes: a reference field that narrows by a
  // sibling reads the half-filled form, so the pick made a moment ago is what
  // the next list is built from.
  const readIdRefOptions = useMemo<IdRefOptionResolver | undefined>(
    () => (resolveIdRefOptions
      ? (targetKind, field) => resolveIdRefOptions(targetKind, field, working)
      : undefined),
    [resolveIdRefOptions, working],
  );

  const binding = useMemo<EditorBinding>(() => ({
    value: readValue,
    onChange: setValue,
    isDirty: NOT_DIRTY,
    disabled: saving,
    resolveIdRefOptions: readIdRefOptions,
    resolveTagSuggestions,
    onCreateTag,
    bounds: readBounds,
  }), [readValue, setValue, saving, readIdRefOptions, resolveTagSuggestions, onCreateTag, readBounds]);

  const submit = useCallback(async () => {
    const id = await handleCreate();
    if (id) onCreated(id);
  }, [handleCreate, onCreated]);

  const actions = (
    <>
      <Button variant="tertiary" onClick={onCancel}>{CANCEL}</Button>
      <Button ref={createRef} variant="primary" disabled={!isComplete || saving} onClick={submit}>
        {saving ? CREATING : CREATE}
      </Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onCancel} title={title} actions={actions} initialFocusRef={createRef}>
      <Box className="create-record-dialog">
        {groups.length === 0 && <Text className="record-editor__empty">{NO_FIELDS}</Text>}
        {groups.map((group) => (
          <EditorGroup key={group.id} group={group} binding={binding} depth={0} />
        ))}
        {error != null && <Text as="p" className="create-record-dialog__error">{error}</Text>}
      </Box>
    </DialogShell>
  );
};

export { CreateRecordDialog };
