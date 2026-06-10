/* @layer electron-main @kind logic */
import { join } from 'path';
import { createWriteStream } from 'fs';
import { once } from 'events';
import { app, net } from 'electron';

/** Reports bytes downloaded so far; `total` is the content-length when known. */
type DownloadProgress = (loaded: number, total?: number) => void;

const downloadToTemp = async (url: string, suffix = '.zip', onProgress?: DownloadProgress): Promise<string> => {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are supported');
  }
  const tempFile = join(app.getPath('temp'), `dl-${Date.now()}${suffix}`);
  const response = await net.fetch(url);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const body = response.body;
  if (!body) throw new Error('Empty response body');

  // Stream the web body chunk-by-chunk so we can count bytes for progress, honoring
  // backpressure via the write stream's 'drain'. (Replaces a plain pipeline.)
  const total = Number(response.headers.get('content-length')) || undefined;
  const reader = body.getReader();
  const fileStream = createWriteStream(tempFile);
  let loaded = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value.byteLength;
      if (!fileStream.write(value)) await once(fileStream, 'drain');
      onProgress?.(loaded, total);
    }
    fileStream.end();
    await once(fileStream, 'finish');
  } catch (err) {
    fileStream.destroy();
    throw err;
  }
  return tempFile;
};

export { downloadToTemp };
export type { DownloadProgress };
