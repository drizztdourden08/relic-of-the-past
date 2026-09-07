/* @layer electron-main @kind logic */
/** Assembles one debug-report .zip from the collected files plus what the renderer sent. */
import JSZip from 'jszip';
import type { DebugReportPackageInput } from '@shared/types/debug-report';
import type { DebugReportCollectedFiles } from './collect-files';
import { encodeCaptureVideos } from './encode-capture-video';

const buildDebugReportZip = async (
  input: DebugReportPackageInput,
  files: DebugReportCollectedFiles,
): Promise<Buffer> => {
  const zip = new JSZip();
  const videos = (await encodeCaptureVideos(input.captureScreenshots)) ?? new Map<number, Buffer>();
  const sessions = new Set(input.navCaptures.map((c) => c.session));

  const manifest = {
    createdAt: Date.now(),
    profileId: input.profileId,
    saves: input.saves.map(({ kind, ref, savedAt }) => ({ kind, ref, savedAt })),
    captureSampleCount: input.navCaptures.length,
    captureScreenshotCount: input.captureScreenshots.length,
    captureSessionCount: sessions.size,
    captureVideoSessions: [...videos.keys()].sort((a, b) => a - b),
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('nav-captures.jsonl', input.navCaptures.map((c) => JSON.stringify(c)).join('\n'));
  zip.file('settings.json', JSON.stringify(files.settingsJson, null, 2));
  zip.file('profile.json', JSON.stringify(files.profileJson, null, 2));
  zip.file('randomizer.json', JSON.stringify(files.randomizerJson, null, 2));
  zip.file('input-profiles.json', JSON.stringify(files.inputProfilesJson, null, 2));

  for (const save of input.saves) {
    zip.file(`save/${save.kind}-${save.ref}.sav`, Buffer.from(save.buffer));
  }

  // A session with a video is skipped as loose frames; anything ffmpeg couldn't (or wasn't
  // available to) encode still ships as PNGs, so a report never loses capture data.
  for (const session of sessions) {
    const video = videos.get(session);
    if (video) {
      zip.file(`capture/session-${session}.mp4`, video);
      continue;
    }
    for (const shot of input.captureScreenshots.filter((s) => s.session === session)) {
      zip.file(`capture/session-${session}-${shot.capturedAt}.png`, Buffer.from(shot.png));
    }
  }
  for (const log of files.logFiles) zip.file(`logs/${log.name}`, log.contents);

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
};

export { buildDebugReportZip };
