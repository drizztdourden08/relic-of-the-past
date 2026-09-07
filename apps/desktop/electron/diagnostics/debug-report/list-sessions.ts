/* @layer electron-main @kind logic */
/** Renderer-facing session listing for the bug-report picker: every recorded capture session
 *  for a profile, with a small preview and its sent state - unlike collect-capture-sessions.ts,
 *  this never mutates anything and isn't filtered to "eligible" sessions, since the player
 *  picks what ships instead of every session being swept in by default. */
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { readCaptureManifest } from './capture-manifest';
import { CAPTURES_SUBDIR, PACKAGED_SUBDIR } from './finalize-capture-session';
import type { DebugCaptureSessionSummary } from '@shared/types/debug-report';

const startedAtOf = (sessionKey: string): number => {
  const match = /^session-(\d+)$/.exec(sessionKey);
  return match ? Number(match[1]) : 0;
};

const sumFileSizes = async (dir: string, names: string[]): Promise<number> => {
  const sizes = await Promise.all(names.map((name) => stat(join(dir, name)).then((s) => s.size).catch(() => 0)));
  return sizes.reduce((sum, size) => sum + size, 0);
};

type PreviewInfo = Pick<DebugCaptureSessionSummary, 'previewUrl' | 'previewFrameUrls' | 'previewKind'>;

const previewFor = (profileId: string, sessionKey: string, hasFullVideo: boolean, packagedNames: string[]): PreviewInfo => {
  const base = `app-debug-capture://captures/${encodeURIComponent(profileId)}/${encodeURIComponent(sessionKey)}`;
  if (hasFullVideo) return { previewUrl: `${base}/video-full.mp4`, previewFrameUrls: [], previewKind: 'video' };
  // No ffmpeg: packaged/ holds the evenly-spread PNG subset itself (see capture-frame-budget.ts)
  // instead of a video - every one of those frames goes to the picker so it can cycle through
  // them as a fake video, not just show the first.
  const frames = packagedNames.filter((n) => n.endsWith('.png')).sort();
  if (frames.length > 0) {
    return {
      previewUrl: null,
      previewFrameUrls: frames.map((name) => `${base}/${PACKAGED_SUBDIR}/${name}`),
      previewKind: 'images',
    };
  }
  return { previewUrl: null, previewFrameUrls: [], previewKind: 'none' };
};

const listCaptureSessions = async (profileId: string): Promise<DebugCaptureSessionSummary[]> => {
  const root = getUserDataPath('profiles', profileId, CAPTURES_SUBDIR);
  const manifest = await readCaptureManifest(profileId);
  const sessionKeys = await readdir(root, { withFileTypes: true })
    .then((entries) => entries.filter((e) => e.isDirectory()).map((e) => e.name))
    .catch(() => [] as string[]);

  return Promise.all(sessionKeys.map(async (sessionKey): Promise<DebugCaptureSessionSummary> => {
    const dir = join(root, sessionKey);
    const packagedDir = join(dir, PACKAGED_SUBDIR);
    const packagedNames = await readdir(packagedDir).catch(() => [] as string[]);
    const hasFullVideo = await stat(join(dir, 'video-full.mp4')).then(() => true).catch(() => false);
    const sizeBytes = await sumFileSizes(packagedDir, packagedNames);
    const preview = previewFor(profileId, sessionKey, hasFullVideo, packagedNames);
    return {
      sessionKey,
      startedAt: startedAtOf(sessionKey),
      sizeBytes,
      ...preview,
      sentAt: manifest[sessionKey]?.sentAt ?? null,
    };
  }));
};

export { listCaptureSessions };
