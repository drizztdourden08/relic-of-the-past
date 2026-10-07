/* @layer renderer-app @kind types */
/** Split out so `create-connection.ts` can share these shapes without a value import cycle. */
import type { InspectorRow } from '../DataInspector.type';

type CreateOutcome = { success: true; id: string } | { success: false; error: string };
type RecordCreator = (draft: InspectorRow) => Promise<CreateOutcome>;

export type { CreateOutcome, RecordCreator };
