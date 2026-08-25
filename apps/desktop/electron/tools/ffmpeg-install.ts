/* @layer electron-main @kind logic */
/**
 * Install the optional ffmpeg tool on request: download the pinned archive, verify it,
 * keep the two binaries, discard everything else.
 *
 * The order is the security property — the checksum is checked while the download is
 * still an inert file in temp, so nothing unverified is ever unpacked into a directory
 * we later execute from.
 */
import { rm } from 'fs/promises';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import { PINNED_FFMPEG, ffmpegAssetUrl } from '@shared/types/ffmpeg-tool';
import { downloadToTemp } from '../lib/download';
import { extractEntriesByBasename } from '../lib/archive';
import { errMessage } from '../lib/result';
import type { FfmpegBinaries } from './ffmpeg-paths';
import { canDownload, exeName, ffmpegToolDir, managedBinaries } from './ffmpeg-paths';
import { ffmpegState, locateFfmpeg } from './ffmpeg-locate';
import { assertChecksumUsable, verifyDownload } from './ffmpeg-verify';

/** Reports each state the install passes through, for a progress bar. */
type StateReporter = (state: FfmpegState) => void;

const downloadPinned = async (report: StateReporter): Promise<string> => {
  report({ status: 'downloading', receivedBytes: 0, totalBytes: PINNED_FFMPEG.sizeBytes });
  return downloadToTemp(ffmpegAssetUrl(PINNED_FFMPEG), '.zip', (received, total) => {
    report({ status: 'downloading', receivedBytes: received, totalBytes: total ?? PINNED_FFMPEG.sizeBytes });
  });
};

/** Keep only the two binaries. Throws when the archive did not carry both. */
const extractBinaries = async (archivePath: string): Promise<FfmpegBinaries> => {
  const wanted = new Set([exeName('ffmpeg').toLowerCase(), exeName('ffprobe').toLowerCase()]);
  const written = await extractEntriesByBasename(archivePath, wanted, ffmpegToolDir());
  if (written.length !== wanted.size) {
    throw new Error(`Archive did not contain both binaries (found ${written.length} of ${wanted.size}).`);
  }
  return managedBinaries();
};

const runInstall = async (report: StateReporter): Promise<FfmpegState> => {
  const existing = await locateFfmpeg();
  if (existing) return { status: 'ready', ...existing };
  if (!canDownload()) return ffmpegState();

  // Fail closed before spending a 140 MB download on an archive we could not vet.
  assertChecksumUsable(PINNED_FFMPEG);

  let archivePath: string | null = null;
  try {
    archivePath = await downloadPinned(report);
    report({ status: 'verifying' });
    await verifyDownload(archivePath, PINNED_FFMPEG);
    return { status: 'ready', ...(await extractBinaries(archivePath)) };
  } finally {
    if (archivePath) await rm(archivePath, { force: true }).catch(() => {});
  }
};

// One install at a time: a second request joins the first rather than racing it into the
// same destination directory.
let pending: Promise<FfmpegState> | null = null;

const installFfmpeg = (report: StateReporter): Promise<FfmpegState> => {
  if (!pending) {
    pending = runInstall(report)
      .catch((err: unknown): FfmpegState => ({ status: 'failed', reason: errMessage(err) }))
      .then((state) => { report(state); return state; })
      .finally(() => { pending = null; });
  }
  return pending;
};

export { installFfmpeg };
export type { StateReporter };
