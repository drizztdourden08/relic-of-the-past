/* @layer sanctuary-site @kind types */
import type { ReportKind } from '@rotp/hub-contracts';
import type { ReportView } from '../endpoints/api-responses.type';

type ReportMatchGroup = { kind: ReportKind; reports: ReportView[] };

export type { ReportMatchGroup };
