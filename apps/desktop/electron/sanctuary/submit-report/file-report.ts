/* @layer electron-main @kind logic */
import { SANCTUARY_ROUTES } from '@shared/sanctuary';
import type { SubmitReportRequest, SubmitReportResult } from '@shared/sanctuary';
import { callApi } from '../../hub/client';
import { SANCTUARY_API } from '../../hub/endpoints';
import { readToken } from '../../hub/token-store';

const fileReport = async (body: SubmitReportRequest): Promise<SubmitReportResult> =>
  callApi<SubmitReportResult>(SANCTUARY_API, { route: SANCTUARY_ROUTES.reportsCreate, body, token: await readToken() });

export { fileReport };
