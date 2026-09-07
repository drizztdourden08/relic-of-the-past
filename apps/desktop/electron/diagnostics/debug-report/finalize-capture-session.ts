/* @layer electron-main @kind logic */
/**
 * Runs the moment a recording stops (see debug-capture-store.ts): writes the raw frames and
 * the position timeline for that one session to their own folder under
 * debug-captures/<profileId>/<sessionKey>/, then encodes them into a video right there, with
 * ffmpeg - all of it immediately, not deferred until a report gets packaged. Encoding is
 * still its own try/catch: a report attaching the raw frames instead of a video beats one
 * that fails outright over a broken ffmpeg install.
 */
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { locateFfmpeg } from '../../tools/ffmpeg-locate';
import { runTool, ENCODE_TIMEOUT_MS } from '../../tools/ffmpeg-run';
import type { DebugCaptureFinalizeInput, DebugCaptureFinalizeResult } from '@shared/types/debug-report';

const CAPTURES_ROOT = 'debug-captures';

const captureSessionDir = (profileId: string, sessionKey: string): string =>
  getUserDataPath(CAPTURES_ROOT, profileId, sessionKey);

const encodeVideo = async (dir: string, frameCount: number): Promise<void> => {
  const found = await locateFfmpeg().catch(() => null);
  if (!found) return;
  try {
    const args = [
      '-y', '-framerate', '1', '-i', join(dir, 'frame_%03d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', join(dir, 'video.mp4'),
    ];
    if (frameCount > 0) await runTool(found.ffmpegPath, args, ENCODE_TIMEOUT_MS);
  } catch {
    // No video; the raw frames already on disk are still a usable report attachment.
  }
};

const finalizeCaptureSession = async (input: DebugCaptureFinalizeInput): Promise<DebugCaptureFinalizeResult> => {
  const { profileId, sessionKey, snapshots, screenshots } = input;
  try {
    const dir = captureSessionDir(profileId, sessionKey);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'snapshots.jsonl'), snapshots.map((s) => JSON.stringify(s)).join('\n'));
    await Promise.all(screenshots.map((shot, i) =>
      writeFile(join(dir, `frame_${String(i + 1).padStart(3, '0')}.png`), Buffer.from(shot.png))));
    await encodeVideo(dir, screenshots.length);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export { finalizeCaptureSession, captureSessionDir, CAPTURES_ROOT };
