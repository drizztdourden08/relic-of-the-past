/* @layer electron-main @kind logic */
/**
 * Encodes each capture session's screenshots into a small H.264 MP4 (1fps, matching the
 * capture cadence) instead of shipping dozens of near-identical PNGs: video inter-frame
 * compression crushes near-static frames far better than independent images do (measured
 * ~87% smaller with no visible quality loss). This is strictly an optimization, never a
 * requirement for a report to send - every step is its own try/catch, because a report that
 * fails outright over a broken ffmpeg install is worse than one that ships plain PNGs.
 */
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { DebugCaptureScreenshot } from '@shared/types/debug-report';
import { locateFfmpeg } from '../../tools/ffmpeg-locate';
import { runTool, ENCODE_TIMEOUT_MS } from '../../tools/ffmpeg-run';

const groupBySession = (shots: DebugCaptureScreenshot[]): Map<number, DebugCaptureScreenshot[]> => {
  const bySession = new Map<number, DebugCaptureScreenshot[]>();
  for (const shot of shots) {
    const list = bySession.get(shot.session) ?? [];
    list.push(shot);
    bySession.set(shot.session, list);
  }
  for (const list of bySession.values()) list.sort((a, b) => a.capturedAt - b.capturedAt);
  return bySession;
};

const encodeSession = async (ffmpegPath: string, dir: string, shots: DebugCaptureScreenshot[]): Promise<Buffer | null> => {
  try {
    await Promise.all(shots.map((shot, i) =>
      writeFile(join(dir, `frame_${String(i + 1).padStart(3, '0')}.png`), Buffer.from(shot.png))));
    const outPath = join(dir, 'out.mp4');
    const args = [
      '-y', '-framerate', '1', '-i', join(dir, 'frame_%03d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', outPath,
    ];
    const result = await runTool(ffmpegPath, args, ENCODE_TIMEOUT_MS);
    if (result.code !== 0) return null;
    return await readFile(outPath);
  } catch {
    return null;
  }
};

/** One MP4 buffer per session that encoded successfully. Null when ffmpeg itself isn't
 *  available (or anything else went wrong finding it); an empty/partial map otherwise, so
 *  the caller falls back to PNGs per session instead of losing the whole report. */
const encodeCaptureVideos = async (
  screenshots: DebugCaptureScreenshot[],
): Promise<Map<number, Buffer> | null> => {
  if (screenshots.length === 0) return new Map();

  const found = await locateFfmpeg().catch(() => null);
  if (!found) return null;

  const bySession = groupBySession(screenshots);
  const videos = new Map<number, Buffer>();
  for (const [session, shots] of bySession) {
    let dir: string;
    try {
      dir = await mkdtemp(join(tmpdir(), 'rotp-debug-capture-'));
    } catch {
      continue;
    }
    try {
      const video = await encodeSession(found.ffmpegPath, dir, shots);
      if (video) videos.set(session, video);
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }
  return videos;
};

export { encodeCaptureVideos };
