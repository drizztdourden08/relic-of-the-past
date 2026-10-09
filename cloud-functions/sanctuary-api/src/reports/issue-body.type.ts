/* @layer root-config @kind types */
import type { SubmitReportRequest } from '../../../../shared/sanctuary';

type IssueBodyInput = SubmitReportRequest & { reporterLine: string; reportId: string };

type IssueBodyRenderer = (input: IssueBodyInput) => string;

export type { IssueBodyInput, IssueBodyRenderer };
