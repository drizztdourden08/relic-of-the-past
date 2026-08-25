/* @layer renderer-components @kind constants */
import type { AmbientRole } from '@shared/game/data/ambient-reach';

/**
 * What a drop zone in the studio accepts. Nothing is transcoded on the way in — the engine
 * decodes each of these itself — so a dropped file lands in the pack byte for byte and can be
 * exported again unchanged.
 */
const AUDIO_ACCEPT = ['.wav', '.mp3', '.ogg', '.flac', '.opus', '.pcm'];

const AUDIO_ACCEPT_HINT = 'wav, mp3, ogg, flac, opus or MSU-1 pcm — click to browse';

/** How the studio names each ambient role on a row. */
const AMBIENT_ROLE_LABELS: Record<AmbientRole, string> = {
  bed: 'Bed', control: 'Control', cue: 'Cue',
};

/** What each role means, for the row's tooltip — the labels alone are too terse to be obvious. */
const AMBIENT_ROLE_HINTS: Record<AmbientRole, string> = {
  bed: 'Starts a looping bed, which plays until another ambient id replaces it',
  control: 'Clears whatever bed is playing, so this id comes out as silence',
  cue: 'A one-off sound raised over whatever the channel is already playing',
};

/** One spelling of the sound search, so the single-channel tab and the merged one read alike. */
const SOUND_FILTER_HINT = 'Matches the id, its name, or the game function that raises it.';
const SOUND_FILTER_PLACEHOLDER = '0x0C, explosion, AncillaAdd_Bomb…';

const UNREACHABLE_DESCRIPTION = (count: number): string =>
  `${count} ids the channel can carry that nothing in the game raises. A pack can still put a sound`
  + ' on one, but it will never play.';

export {
  SOUND_FILTER_HINT, SOUND_FILTER_PLACEHOLDER, UNREACHABLE_DESCRIPTION, AMBIENT_ROLE_HINTS, AMBIENT_ROLE_LABELS, AUDIO_ACCEPT, AUDIO_ACCEPT_HINT };
