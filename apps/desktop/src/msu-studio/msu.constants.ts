/* @layer renderer-components @kind constants */
import type { AmbientRole } from '@rotp/game-data';

const AUDIO_ACCEPT = ['.wav', '.mp3', '.ogg', '.flac', '.opus', '.pcm'];

const AUDIO_ACCEPT_HINT = 'wav, mp3, ogg, flac, opus or MSU-1 pcm. Click to browse';

const AMBIENT_ROLE_LABELS: Record<AmbientRole, string> = {
  bed: 'Bed', control: 'Control', cue: 'Cue',
};

const AMBIENT_ROLE_HINTS: Record<AmbientRole, string> = {
  bed: 'Starts a looping bed, which plays until another ambient id replaces it',
  control: 'Clears whatever bed is playing, so this id comes out as silence',
  cue: 'A one-off sound raised over whatever the channel is already playing',
};

const SOUND_FILTER_HINT = 'Matches the id, its name, or the game function that raises it.';
const SOUND_FILTER_PLACEHOLDER = '0x0C, explosion, AncillaAdd_Bomb...';

const UNREACHABLE_DESCRIPTION = (count: number): string =>
  `${count} ids the channel can carry that nothing in the game raises. A pack can still put a sound`
  + ' on one, but it will never play.';

export {
  SOUND_FILTER_HINT, SOUND_FILTER_PLACEHOLDER, UNREACHABLE_DESCRIPTION, AMBIENT_ROLE_HINTS, AMBIENT_ROLE_LABELS, AUDIO_ACCEPT, AUDIO_ACCEPT_HINT };
