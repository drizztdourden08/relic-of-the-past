/* @layer store-site @kind logic */
import { requestDownload } from '../api/catalog-endpoints';
import type { DownloadResponse } from '@rotp/hub-contracts';

const startDownload = async (itemId: string, version?: number): Promise<DownloadResponse> => {
  const grant = await requestDownload(itemId, version === undefined ? {} : { version });
  window.location.assign(grant.url);
  return grant;
};

export { startDownload };
