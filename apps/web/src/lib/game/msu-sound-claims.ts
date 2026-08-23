/* @layer bridge-wasm @kind logic */
/**
 * What the core is told about replacement sounds when a session starts and stops.
 *
 * Two things travel together and must never disagree: the gate bit that hands a channel over,
 * and the mask of ids taken over on it. A channel the settings switch off publishes an empty
 * mask AND a cleared gate, so the core cannot report it at all — the app is not merely ignoring
 * those events, it never receives them.
 *
 * A gate is armed only when the pack actually authors something on that channel. An armed gate
 * with an empty mask would be a channel handed over with nothing to play it.
 */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { manifestSoundIds, soundClaimMask, SOUND_CHANNELS } from '../msu/sound-claim';
import { setExternalAmbient, setExternalSfx } from './bridge/host-gates';
import { clearSoundClaims, setSoundClaim } from './bridge/sound-claim';

/** Whether each group of channels may be replaced at all — both false under Vanilla Safe. */
interface SoundReplacement {
  ambient: boolean;
  sfx: boolean;
}

/** How many ids ended up claimed per channel, for the session's log line. */
type ClaimedCounts = Record<SoundChannel, number>;

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

/** Hand every channel back to the sound chip. */
const withdrawSoundClaims = (): void => {
  setExternalAmbient(false);
  setExternalSfx(false);
  clearSoundClaims();
};

export { publishSoundClaims, withdrawSoundClaims };
export type { SoundReplacement, ClaimedCounts };
