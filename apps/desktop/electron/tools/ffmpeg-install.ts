/* @layer electron-main @kind logic */
/**
 * Install the optional ffmpeg tool on request: resolve the current release asset, download
 * it, verify it, keep the two binaries. The order is the security property: the checksum is
 * checked while the download is still an inert file in temp.
 */
import { rm } from 'fs/promises';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import { PINNED_FFMPEG } from '@shared/types/ffmpeg-tool';
import { downloadToTemp } from '../lib/download';
import { extractEntriesByBasename } from '../lib/archive';
import { errMessage } from '../lib/result';
import type { FfmpegBinaries } from './ffmpeg-paths';
import { canDownload, exeName, ffmpegToolDir, managedBinaries } from './ffmpeg-paths';
import { ffmpegState, locateFfmpeg } from './ffmpeg-locate';
import { resolveFfmpegAsset } from './ffmpeg-release';
import { verifyDownload } from './ffmpeg-verify';

/** Reports each state the install passes through, for a progress bar. */
type StateReporter = (state: FfmpegState) => void;

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

  const asset = await resolveFfmpegAsset(PINNED_FFMPEG);

  let archivePath: string | null = null;
  try {
    report({ status: 'downloading', receivedBytes: 0, totalBytes: asset.sizeBytes });
    archivePath = await downloadToTemp(asset.downloadUrl, '.zip', (received, total) => {
      report({ status: 'downloading', receivedBytes: received, totalBytes: total ?? asset.sizeBytes });
    });
    report({ status: 'verifying' });
    await verifyDownload(archivePath, asset.sizeBytes, asset.sha256);
    return { status: 'ready', ...(await extractBinaries(archivePath)) };
  } finally {
    if (archivePath) await rm(archivePath, { force: true }).catch(() => {});
  }
};

// One install at a time: a second request joins the first.
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
