/* @layer electron-main @kind logic */
/**
 * Runs the moment a recording stops (see debug-capture-store.ts): writes every raw frame and
 * the position timeline for that one session under
 * profiles/<profileId>/debug-captures/<sessionKey>/ - alongside that profile's saves,
 * config.json, sessions.json etc, same as every other profile-owned folder. Living under the
 * profile means deleting the profile takes its capture data with it, same as saves.
 *
 * Two videos come out of this, because the local copy and the one a report ships are under
 * different rules: the local recording has no size limit (only the 5-minute time limit the
 * store itself enforces), so `video-full.mp4` encodes every frame captured. `packaged/` holds
 * what a report actually sends: a video downsampled to fit PACKAGED_BUDGET_BYTES, built by
 * re-encoding an evenly spread subset of the same frames (see capture-frame-budget.ts) once
 * the full video turns out to be over budget. No ffmpeg falls back to shipping that same
 * evenly spread subset as raw PNGs instead of a video, sized against their own byte count.
 */
import { writeFile, mkdir, copyFile, rm, stat } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { locateFfmpeg } from '../../tools/ffmpeg-locate';
import { runTool, ENCODE_TIMEOUT_MS } from '../../tools/ffmpeg-run';
import { frameName, pickEvenlySpread, budgetedFrameCount } from './capture-frame-budget';
import type {
  DebugCaptureFinalizeInput, DebugCaptureFinalizeResult, DebugCaptureScreenshot,
} from '@shared/types/debug-report';

const CAPTURES_SUBDIR = 'debug-captures';
const PACKAGED_SUBDIR = 'packaged';
const PACKAGED_BUDGET_BYTES = 2 * 1024 * 1024;
const VIDEO_FPS = '16';

const captureSessionDir = (profileId: string, sessionKey: string): string =>
  getUserDataPath('profiles', profileId, CAPTURES_SUBDIR, sessionKey);

const encodeFromFrameDir = async (ffmpegPath: string, frameDir: string, outPath: string): Promise<boolean> => {
  const args = [
    '-y', '-framerate', VIDEO_FPS, '-i', join(frameDir, 'frame_%04d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', outPath,
  ];
  const result = await runTool(ffmpegPath, args, ENCODE_TIMEOUT_MS);
  return result.code === 0;
};

const buildPackagedVideo = async (
  ffmpegPath: string, dir: string, packagedDir: string, frameNames: string[], fullVideoPath: string,
): Promise<void> => {
  const fullStat = await stat(fullVideoPath).catch(() => null);
  if (!fullStat) return;
  if (fullStat.size <= PACKAGED_BUDGET_BYTES) {
    await copyFile(fullVideoPath, join(packagedDir, 'video.mp4'));
    return;
  }
  const targetCount = budgetedFrameCount(fullStat.size, frameNames.length, PACKAGED_BUDGET_BYTES);
  const selected = pickEvenlySpread(frameNames, targetCount);
  const scratchDir = join(dir, '.packaged-frames');
  await mkdir(scratchDir, { recursive: true });
  try {
    await Promise.all(selected.map((name, i) => copyFile(join(dir, name), join(scratchDir, frameName(i)))));
    await encodeFromFrameDir(ffmpegPath, scratchDir, join(packagedDir, 'video.mp4'));
  } finally {
    await rm(scratchDir, { recursive: true, force: true }).catch(() => {});
  }
};

const buildPackagedFrames = async (
  packagedDir: string, dir: string, screenshots: DebugCaptureScreenshot[], frameNames: string[],
): Promise<void> => {
  const totalBytes = screenshots.reduce((sum, s) => sum + s.png.byteLength, 0);
  const targetCount = budgetedFrameCount(totalBytes, frameNames.length, PACKAGED_BUDGET_BYTES);
  const selected = pickEvenlySpread(frameNames, targetCount);
  await Promise.all(selected.map((name, i) => copyFile(join(dir, name), join(packagedDir, frameName(i)))));
};

const finalizeCaptureSession = async (input: DebugCaptureFinalizeInput): Promise<DebugCaptureFinalizeResult> => {
  const { profileId, sessionKey, snapshots, screenshots } = input;
  try {
    const dir = captureSessionDir(profileId, sessionKey);
    const packagedDir = join(dir, PACKAGED_SUBDIR);
    await mkdir(packagedDir, { recursive: true });
    await writeFile(join(dir, 'snapshots.jsonl'), snapshots.map((s) => JSON.stringify(s)).join('\n'));

    const frameNames = screenshots.map((_, i) => frameName(i));
    await Promise.all(screenshots.map((shot, i) => writeFile(join(dir, frameName(i)), Buffer.from(shot.png))));
    if (frameNames.length === 0) return { ok: true };

    const found = await locateFfmpeg().catch(() => null);
    if (!found) {
      await buildPackagedFrames(packagedDir, dir, screenshots, frameNames);
      return { ok: true };
    }

    try {
      const fullVideoPath = join(dir, 'video-full.mp4');
      const encoded = await encodeFromFrameDir(found.ffmpegPath, dir, fullVideoPath);
      if (encoded) {
        await buildPackagedVideo(found.ffmpegPath, dir, packagedDir, frameNames, fullVideoPath);
      } else {
        await buildPackagedFrames(packagedDir, dir, screenshots, frameNames);
      }
    } catch {
      await buildPackagedFrames(packagedDir, dir, screenshots, frameNames).catch(() => {});
    }
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export { finalizeCaptureSession, captureSessionDir, CAPTURES_SUBDIR, PACKAGED_SUBDIR };
