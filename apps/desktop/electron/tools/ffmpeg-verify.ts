/* @layer electron-main @kind logic */
/**
 * Checksum gate for a downloaded tool archive.
 *
 * This runs BEFORE anything is extracted: an archive we have not verified must never
 * become an executable we then run. It fails closed in both directions — a mismatch and
 * a not-yet-filled-in pinned checksum are both refusals, never a skip.
 */
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { rm, stat } from 'fs/promises';
import type { FfmpegRelease } from '@shared/types/ffmpeg-tool';
import { isChecksumUnset } from '@shared/types/ffmpeg-tool';

/** Lowercase hex SHA-256 of a file, read as a stream so a large archive is not buffered. */
const sha256File = async (filePath: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk as Buffer);
  return hash.digest('hex');
};

/**
 * Throws unless the pinned checksum is real AND the file matches it. Nothing else may
 * gate an extraction, so callers pass the release straight through from the pin.
 */
const assertChecksumUsable = (release: FfmpegRelease): void => {
  if (isChecksumUnset(release)) {
    throw new Error(
      `No published checksum is pinned for ${release.asset}. Fill in its SHA-256 before installing.`,
    );
  }
};

/** Verify a download, deleting it on any failure so a bad archive cannot be reused. */
const verifyDownload = async (filePath: string, release: FfmpegRelease): Promise<void> => {
  try {
    assertChecksumUsable(release);
    const { size } = await stat(filePath);
    if (size !== release.sizeBytes) {
      throw new Error(`Download size mismatch: expected ${release.sizeBytes} bytes, got ${size}.`);
    }
    const digest = await sha256File(filePath);
    if (digest !== release.sha256) {
      throw new Error(`Checksum mismatch: expected ${release.sha256}, got ${digest}.`);
    }
  } catch (err) {
    await rm(filePath, { force: true }).catch(() => {});
    throw err;
  }
};

export { assertChecksumUsable, sha256File, verifyDownload };
