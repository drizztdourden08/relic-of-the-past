/* @layer root-config @kind types */
import type { SubmitReportRequest } from '../../../../shared/sanctuary';

/** What a body renderer gets: the request as submitted, plus the two lines
 *  only the server knows, the reporter line and the minted report id. */
type IssueBodyInput = SubmitReportRequest & { reporterLine: string; reportId: string };

type IssueBodyRenderer = (input: IssueBodyInput) => string;

export type { IssueBodyInput, IssueBodyRenderer };
