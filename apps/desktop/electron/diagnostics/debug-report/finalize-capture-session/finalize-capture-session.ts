/* @layer electron-main @kind logic */
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import type { DebugCaptureFinalizeInput, DebugCaptureFinalizeResult } from '@shared/types/debug-report';
import { FFMPEG_TOOL_ID } from '@shared/types/ffmpeg-tool';
import { frameName } from '../capture-frame-budget';
import { buildPackagedFrames } from './build-packaged-frames';
import { buildPackagedVideo } from './build-packaged-video';
import { captureSessionDir } from './capture-session-dir';
import { encodeFromFrameDir } from './encode-from-frame-dir';
import { PACKAGED_SUBDIR } from './finalize-capture-session.constants';

const finalizeCaptureSession = async (
  tools: ToolsMain, input: DebugCaptureFinalizeInput,
): Promise<DebugCaptureFinalizeResult> => {
  const { profileId, sessionKey, snapshots, screenshots } = input;
  try {
    const dir = captureSessionDir(profileId, sessionKey);
    const packagedDir = join(dir, PACKAGED_SUBDIR);
    await mkdir(packagedDir, { recursive: true });
    await writeFile(join(dir, 'snapshots.jsonl'), snapshots.map((s) => JSON.stringify(s)).join('\n'));

    const frameNames = screenshots.map((_, i) => frameName(i));
    await Promise.all(screenshots.map((shot, i) => writeFile(join(dir, frameName(i)), Buffer.from(shot.png))));
    if (frameNames.length === 0) return { ok: true };

    const ffmpeg = await tools.state(FFMPEG_TOOL_ID).catch(() => null);
    if (ffmpeg?.status !== 'ready') {
      await buildPackagedFrames(packagedDir, dir, screenshots, frameNames);
      return { ok: true };
    }

    try {
      const fullVideoPath = join(dir, 'video-full.mp4');
      const encoded = await encodeFromFrameDir(tools, dir, fullVideoPath);
      if (encoded) {
        await buildPackagedVideo(tools, { dir, packagedDir, frameNames, fullVideoPath });
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

export { finalizeCaptureSession };
