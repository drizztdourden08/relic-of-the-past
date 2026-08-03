/* @layer renderer-app @kind hook */
/**
 * State for one collection's "New record" flow: the dialog's open flag, the
 * trimmed schema and blank draft it starts from, and the required-path list
 * that gates its Create button.
 */
import { useCallback, useMemo, useState } from 'react';
import { blankRecordFor } from './blank-record';
import { createSchemaFor } from './create-schema';
import { RECORD_CREATORS } from './record-creators';
import { requiredPaths } from './required-fields';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';

const useCreateRecordDialog = (
  kind: EntityKind,
  schema: readonly FieldDescriptor[],
  onCreated: (id: string) => void,
) => {
  const [open, setOpen] = useState(false);

  const createSchema = useMemo(() => createSchemaFor(kind, schema), [kind, schema]);
  const initialRecord = useMemo(() => blankRecordFor(createSchema), [createSchema]);
  const paths = useMemo(() => requiredPaths(createSchema), [createSchema]);

  const openDialog = useCallback(() => setOpen(true), []);
  const cancelDialog = useCallback(() => setOpen(false), []);

  const handleCreated = useCallback((id: string) => {
    setOpen(false);
    onCreated(id);
  }, [onCreated]);

  return {
    open,
    openDialog,
    cancelDialog,
    handleCreated,
    createSchema,
    initialRecord,
    requiredPaths: paths,
    /** Undefined when this collection has no create write path — omit the button entirely. */
    onCreate: RECORD_CREATORS[kind],
  };
};

export { useCreateRecordDialog };
