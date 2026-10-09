/* @layer renderer-app @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import { blankRecordFor } from './blank-record';
import { createSchemaFor } from './create-schema';
import { RECORD_CREATORS } from './record-creators';
import { requiredPaths } from './required-fields';

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
    onCreate: RECORD_CREATORS[kind],
  };
};

export { useCreateRecordDialog };
