/* @layer electron-main @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import { callApi } from '../../hub/client';
import { SANCTUARY_API } from '../../hub/endpoints';
import { readToken } from '../../hub/token-store';
import { ZIP_CONTENT_TYPE } from './submit-report.constants';

const uploadReportZip = async (reportId: string, uploadUrl: string, zip: Buffer): Promise<void> => {
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': ZIP_CONTENT_TYPE, 'Content-Length': String(zip.byteLength) },
    body: new Uint8Array(zip),
  });
  if (!put.ok) throw new Error(mainText(msg('main:sanctuary.report.uploadStatus', { status: put.status })));
  await callApi(SANCTUARY_API, { route: SANCTUARY_ROUTES.reportsComplete, params: { id: reportId }, body: {}, token: await readToken() });
};

export { uploadReportZip };
