/* @layer renderer-app @kind types */
import type { InspectorRow } from '../DataInspector.type';

type CreateOutcome =
  | { success: true; id: string }
  | { success: false; error: string; needsReview?: boolean };
type RecordCreator = (draft: InspectorRow) => Promise<CreateOutcome>;

export type { CreateOutcome, RecordCreator };
