/* @layer renderer-app @kind types */
/**
 * Split out of record-creators.ts so `create-connection.ts` (the connection
 * collection's own creator, pulled into its own file because a connection is
 * never created alone) can share the same shapes without importing a VALUE
 * from record-creators.ts, which imports it back — a type-only edge collapses
 * at compile time either way, but a real file keeps the intent explicit.
 */
import type { InspectorRow } from '../DataInspector.type';

type CreateOutcome = { success: true; id: string } | { success: false; error: string };
type RecordCreator = (draft: InspectorRow) => Promise<CreateOutcome>;

export type { CreateOutcome, RecordCreator };
