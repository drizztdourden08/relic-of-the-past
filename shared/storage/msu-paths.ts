/* @layer shared-storage @kind logic */
/**
 * Pack paths, the audio-extension set, and the filename guard shared by the MSU
 * read and edit surfaces. Pack and file names come from user input (imported
 * archives, the pack editor), so every name that becomes a path segment is
 * checked for traversal before it is joined.
 */

/** Extensions the engine can decode: the two MSU formats plus browser-playable audio. */
const AUDIO_EXTENSIONS = ['pcm', 'opuz', 'wav', 'mp3', 'ogg', 'flac', 'opus', 'm4a'] as const;
const AUDIO_RE = new RegExp(`\\.(${AUDIO_EXTENSIONS.join('|')})$`, 'i');

const packDir = (pack: string): string => `msu/${pack}`;

const isAudioFile = (name: string): boolean => AUDIO_RE.test(name);

const isSafeName = (name: string): boolean =>
  name.length > 0 && !name.includes('..') && !name.includes('/') && !name.includes('\\');

const assertSafeName = (name: string): void => {
  if (!isSafeName(name)) throw new Error('Invalid filename');
};

/** Path of one file inside a pack, guarded against traversal. */
const packFile = (pack: string, fileName: string): string => {
  assertSafeName(fileName);
  return `${packDir(pack)}/${fileName}`;
};

export { AUDIO_EXTENSIONS, packDir, packFile, isAudioFile, isSafeName, assertSafeName };
