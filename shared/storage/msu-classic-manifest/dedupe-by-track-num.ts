/* @layer shared-storage @kind logic */
import type { ClassicTrack } from './msu-classic-manifest.type';

const dedupeByTrackNum = (tracks: ClassicTrack[]): ClassicTrack[] => {
  const best = new Map<number, ClassicTrack>();
  for (const track of [...tracks].sort((a, b) => a.fileName.localeCompare(b.fileName))) {
    const existing = best.get(track.trackNum);
    if (!existing) { best.set(track.trackNum, track); continue; }
    const canonical = new RegExp(`^${track.trackNum}\\.[a-z0-9]+$`, 'i');
    if (canonical.test(track.fileName)) best.set(track.trackNum, track);
  }
  return [...best.values()].sort((a, b) => a.trackNum - b.trackNum);
};

export { dedupeByTrackNum };
