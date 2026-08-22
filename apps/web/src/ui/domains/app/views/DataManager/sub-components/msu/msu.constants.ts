/* @layer renderer-components @kind constants */

/**
 * What a drop zone in the studio accepts. Nothing is transcoded on the way in — the engine
 * decodes each of these itself — so a dropped file lands in the pack byte for byte and can be
 * exported again unchanged.
 */
const AUDIO_ACCEPT = ['.wav', '.mp3', '.ogg', '.flac', '.opus', '.pcm'];

const AUDIO_ACCEPT_HINT = 'wav, mp3, ogg, flac, opus or MSU-1 pcm — click to browse';

export { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT };
