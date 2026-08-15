/* @layer renderer-app @kind types */
/**
 * Split out of record-creators.ts so `create-connection.ts` (the connection
 * collection's own creator, pulled into its own file because a connection is
 * never created alone) can share the same shapes without importing a VALUE
 * from record-creators.ts, which imports it back — a type-only edge collapses
 * at compile time either way, but a real file keeps the intent explicit.
 */
import type { InspectorRow } from '../DataInspector.type';

/**
 * `needsReview` marks a refusal a person settles rather than a write that
 * broke — the record already exists, say. A batch caller skips those instead
 * of reporting them as failures.
 */
type CreateOutcome =
  | { success: true; id: string }
  | { success: false; error: string; needsReview?: boolean };
type RecordCreator = (draft: InspectorRow) => Promise<CreateOutcome>;

export type { CreateOutcome, RecordCreator };
