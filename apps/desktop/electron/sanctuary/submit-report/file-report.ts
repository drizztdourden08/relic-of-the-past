/* @layer electron-main @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import type { SubmitReportRequest, SubmitReportResult } from '@rotp/hub-contracts';
import { callApi } from '../../hub/client';
import { SANCTUARY_API } from '../../hub/endpoints';
import { readToken } from '../../hub/token-store';

const fileReport = async (body: SubmitReportRequest): Promise<SubmitReportResult> =>
  callApi<SubmitReportResult>(SANCTUARY_API, { route: SANCTUARY_ROUTES.reportsCreate, body, token: await readToken() });

export { fileReport };
