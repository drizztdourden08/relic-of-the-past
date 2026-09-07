/* @layer electron-main @kind logic */
/**
 * Checksum gate for a downloaded tool archive.
 *
 * This runs BEFORE anything is extracted: an archive that hasn't been verified must never
 * become an executable that then runs. The expected size and digest come from
 * ffmpeg-release.ts, resolved fresh against the current release right before the download -
 * never a build-time constant.
 */
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { rm, stat } from 'fs/promises';

/** Lowercase hex SHA-256 of a file, read as a stream so a large archive is not buffered. */
const sha256File = async (filePath: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk as Buffer);
  return hash.digest('hex');
};

/** Verify a download, deleting it on any failure so a bad archive cannot be reused. */
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

export { sha256File, verifyDownload };
