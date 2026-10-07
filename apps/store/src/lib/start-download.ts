/* @layer store-site @kind logic */
/**
 * Downloads a pack in the browser: asks the API for a short-lived link (which counts the
 * download), then sends the browser to it. The link names the file, so it saves as
 * `<slug>-<version>.<ext>`.
 */
import { requestDownload } from '../api/catalog-endpoints';
import type { DownloadResponse } from '@shared/store/api-types';

const startDownload = async (itemId: string, version?: number): Promise<DownloadResponse> => {
  const grant = await requestDownload(itemId, version === undefined ? {} : { version });
  window.location.assign(grant.url);
  return grant;
};

export { startDownload };
