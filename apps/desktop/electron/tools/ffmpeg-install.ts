/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';
import { PINNED_FFMPEG } from '@shared/types/ffmpeg-tool';
import { downloadToTempFile } from '../lib/download';
import { extractEntriesByBasename } from '../lib/archive';
import { errMessage } from '../lib/result';
import type { FfmpegBinaries } from './ffmpeg-paths';
import { canDownload, exeName, ffmpegToolDir, managedBinaries } from './ffmpeg-paths';
import { ffmpegState, locateFfmpeg } from './ffmpeg-locate';
import { resolveFfmpegAsset } from './ffmpeg-release';
import { verifyDownload } from './ffmpeg-verify';
import type { StateReporter } from './ffmpeg-install.type';

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
    archivePath = await downloadToTempFile(asset.downloadUrl, '.zip', (received, total) => {
      report({ status: 'downloading', receivedBytes: received, totalBytes: total ?? asset.sizeBytes });
    });
    report({ status: 'verifying' });
    await verifyDownload(archivePath, asset.sizeBytes, asset.sha256);
    return { status: 'ready', ...(await extractBinaries(archivePath)) };
  } finally {
    if (archivePath) await rm(archivePath, { force: true }).catch(() => {});
  }
};

let runningInstall: Promise<FfmpegState> | null = null;

const installFfmpeg = (report: StateReporter): Promise<FfmpegState> => {
  if (!runningInstall) {
    runningInstall = runInstall(report)
      .catch((err: unknown): FfmpegState => ({ status: 'failed', reason: errMessage(err) }))
      .then((state) => { report(state); return state; })
      .finally(() => { runningInstall = null; });
  }
  return runningInstall;
};

export { installFfmpeg };
export type { StateReporter };
