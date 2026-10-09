/* @layer electron-main @kind logic */
import { rm, stat } from 'fs/promises';
import { sha256File } from './sha256-file';

const verifyDownload = async (filePath: string, expectedSizeBytes: number, expectedSha256: string): Promise<void> => {
  try {
    const { size } = await stat(filePath);
    if (size !== expectedSizeBytes) {
      throw new Error(`Download size mismatch: expected ${expectedSizeBytes} bytes, got ${size}.`);
    }
    const digest = await sha256File(filePath);
    if (digest !== expectedSha256) {
      throw new Error(`Checksum mismatch: expected ${expectedSha256}, got ${digest}.`);
    }
  } catch (err) {
    await rm(filePath, { force: true }).catch(() => {});
    throw err;
  }
};

export { verifyDownload };
