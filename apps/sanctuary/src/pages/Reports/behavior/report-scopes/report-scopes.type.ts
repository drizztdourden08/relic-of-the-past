/* @layer sanctuary-site @kind types */
import type { ReportView } from '../../../../api/api-responses.type';

type ReportPredicate = (report: ReportView) => boolean;

export type { ReportPredicate };
