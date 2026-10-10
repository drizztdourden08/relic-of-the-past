/* @layer sanctuary-site @kind types */
import type { ReportView } from '../../../endpoints/api-responses.type';

type ReportPredicate = (report: ReportView) => boolean;

export type { ReportPredicate };
