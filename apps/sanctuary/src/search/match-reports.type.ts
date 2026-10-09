/* @layer sanctuary-site @kind types */
import type { ReportKind } from '@shared/sanctuary/report-types';
import type { ReportView } from '../api/api-responses.type';

type ReportMatchGroup = { kind: ReportKind; reports: ReportView[] };

export type { ReportMatchGroup };
