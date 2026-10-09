/* @layer electron-main @kind logic */
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { readCaptureManifest } from './capture-manifest';
import { CAPTURES_SUBDIR, PACKAGED_SUBDIR } from './finalize-capture-session';
import type { DebugCaptureSessionSummary } from '@shared/types/debug-report';
import type { PreviewInfo } from './list-sessions.type';

const startedAtOf = (sessionKey: string): number => {
  const match = /^session-(\d+)$/.exec(sessionKey);
  return match ? Number(match[1]) : 0;
};

const sumFileSizes = async (dir: string, names: string[]): Promise<number> => {
  const sizes = await Promise.all(names.map((name) => stat(join(dir, name)).then((s) => s.size).catch(() => 0)));
  return sizes.reduce((sum, size) => sum + size, 0);
};

const previewFor = (profileId: string, sessionKey: string, hasFullVideo: boolean, packagedNames: string[]): PreviewInfo => {
  const base = `app-debug-capture://captures/${encodeURIComponent(profileId)}/${encodeURIComponent(sessionKey)}`;
  if (hasFullVideo) return { previewUrl: `${base}/video-full.mp4`, previewFrameUrls: [], previewKind: 'video' };
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
