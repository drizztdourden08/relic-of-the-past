/* @layer renderer-app @kind types */
/** Split out so `create-connection.ts` can share these shapes without a value import cycle. */
import type { InspectorRow } from '../DataInspector.type';

/**
 * `needsReview` marks a refusal a person settles instead of a write that broke,
 * when the record already exists, say. A batch caller skips those instead of
 * reporting them as failures.
 */
type CreateOutcome =
  | { success: true; id: string }
  | { success: false; error: string; needsReview?: boolean };
type RecordCreator = (draft: InspectorRow) => Promise<CreateOutcome>;

export type { CreateOutcome, RecordCreator };
