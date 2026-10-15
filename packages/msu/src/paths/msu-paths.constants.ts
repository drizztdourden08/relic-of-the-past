/* @layer shared-storage @kind constants */
const AUDIO_EXTENSIONS = ['pcm', 'opuz', 'wav', 'mp3', 'ogg', 'flac', 'opus', 'm4a'] as const;
const AUDIO_RE = new RegExp(`\\.(${AUDIO_EXTENSIONS.join('|')})$`, 'i');
const TRACK_NUMBER_RE = new RegExp(`(\\d+)\\.(${AUDIO_EXTENSIONS.join('|')})$`, 'i');

export { AUDIO_RE, TRACK_NUMBER_RE };
