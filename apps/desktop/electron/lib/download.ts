/* @layer electron-main @kind logic */
import { join } from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { app, net } from 'electron';

const downloadToTemp = async (url: string, suffix = '.zip'): Promise<string> => {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are supported');
  }
  const tempFile = join(app.getPath('temp'), `dl-${Date.now()}${suffix}`);
  const response = await net.fetch(url);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const body = response.body;
  if (!body) throw new Error('Empty response body');
  const fileStream = createWriteStream(tempFile);
  await pipeline(body, fileStream);
  return tempFile;
};

export { downloadToTemp };
