/* @layer bridge-wasm @kind logic */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import { manifestSoundIds, soundClaimMask, SOUND_CHANNELS } from '../../msu/sound-claim';
import { setExternalAmbient, setExternalSfx } from '@rotp/game-core';
import { setSoundClaim } from '../bridge/sound-claim';
import type { ClaimedCounts, SoundReplacement } from './msu-sound-claims.type';

const publishSoundClaims = (manifest: MsuPackManifest, allow: SoundReplacement): ClaimedCounts => {
  const allowed: Record<SoundChannel, boolean> = {
    ambient: allow.ambient, sfx1: allow.sfx, sfx2: allow.sfx,
  };
  const claimed: ClaimedCounts = { ambient: 0, sfx1: 0, sfx2: 0 };

  for (const channel of SOUND_CHANNELS) {
    const ids = allowed[channel] ? manifestSoundIds(manifest, channel) : [];
    claimed[channel] = ids.length;
    setSoundClaim(channel, soundClaimMask(ids));
  }

  setExternalAmbient(claimed.ambient > 0);
  setExternalSfx(claimed.sfx1 + claimed.sfx2 > 0);
  return claimed;
};

export { publishSoundClaims };
