/* @layer electron-main @kind logic */
import { join } from 'path';
import { createWriteStream } from 'fs';
import type { WriteStream } from 'fs';
import { rm } from 'fs/promises';
import { once } from 'events';
import { app, net } from 'electron';
import type { DownloadProgress } from './download.type';
import { streamBodyToFile } from './stream-body-to-file';

const removePartialFile = async (fileStream: WriteStream, tempFile: string): Promise<void> => {
  if (!fileStream.closed) await once(fileStream, 'close');
  await rm(tempFile, { force: true });
};

const contentLengthOf = (response: Response): number | undefined =>
  Number(response.headers.get('content-length')) || undefined;

const downloadToTempFile = async (
  url: string, suffix = '.zip', onProgress?: DownloadProgress, signal?: AbortSignal,
): Promise<string> => {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are supported');
  }
  const tempFile = join(app.getPath('temp'), `dl-${Date.now()}${suffix}`);
  const response = await net.fetch(url, { signal });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const body = response.body;
  if (!body) throw new Error('Empty response body');

  const reader = body.getReader();
  const fileStream = createWriteStream(tempFile);
  try {
    await streamBodyToFile({ reader, fileStream, total: contentLengthOf(response), onProgress });
  } catch (err) {
    fileStream.destroy();
    if (signal?.aborted) await removePartialFile(fileStream, tempFile);
    throw err;
  }
  return tempFile;
};

export { downloadToTempFile };
