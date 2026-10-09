/* @layer bridge-wasm @kind logic */
import type { PreviewTarget } from '@rotp/game-core';
import { renderOriginalSound } from '@rotp/game-core';
import { ensurePreviewModule } from '../preview-core';
import { audibleLength, originalSoundState, soundKeyOf, PROBE_SECONDS } from '@rotp/msu';

const probeAudibleIds = async (target: PreviewTarget, ids: number[]): Promise<Set<number>> => {
  const audible = new Set<number>();
  if (await ensurePreviewModule() === null) return audible;
  for (const id of ids) {
    const cached = originalSoundState.cache.get(soundKeyOf(target, id));
    if (cached !== undefined) {
      if (cached.audible) audible.add(id);
      continue;
    }
    const rendered = renderOriginalSound(target, id, PROBE_SECONDS);
    if (rendered === null) return audible;
    if (audibleLength(rendered.samples) > 0) audible.add(id);
  }
  return audible;
};

export { probeAudibleIds };
