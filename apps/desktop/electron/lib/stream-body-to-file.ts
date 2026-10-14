/* @layer electron-main @kind logic */
import { once } from 'events';
import type { StreamBodyParams } from './stream-body-to-file.type';

const streamBodyToFile = async (params: StreamBodyParams): Promise<void> => {
  const { reader, fileStream, total, onProgress } = params;
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    if (!fileStream.write(value)) await once(fileStream, 'drain');
    onProgress?.(loaded, total);
  }
  fileStream.end();
  await once(fileStream, 'finish');
};

export { streamBodyToFile };
