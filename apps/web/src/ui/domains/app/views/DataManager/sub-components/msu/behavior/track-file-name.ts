/* @layer renderer-components @kind logic */
/**
 * Filename rules for a pack's numbered slots.
 *
 * A pack without a manifest identifies a slot purely by the number at the end of a filename,
 * so assigning or uploading audio to a slot means producing the right name — and the prefix
 * has to match whatever the pack already uses, or the pack stops recognising its own files.
 */

/** `pack-05.pcm` → prefix `pack-`, number `05`, extension `pcm`. */
const NUMBERED_RE = /^(.*?)(\d+)\.([a-z0-9]+)$/i;
const UNSAFE_RE = /[\\/:*?"<>|]/g;

const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.');
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
  return ext.length > 0 ? ext : 'pcm';
};

const stemOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
};

/** The text every numbered file in the pack shares before its number. */
const namePrefixOf = (fileNames: string[], packName: string): string => {
  for (const name of fileNames) {
    const match = NUMBERED_RE.exec(name);
    if (match) return match[1];
  }
  return `${packName.replace(UNSAFE_RE, '_')}-`;
};

const canonicalTrackName = (prefix: string, trackNum: number, ext: string): string =>
  `${prefix}${trackNum}.${ext}`;

/** Turns a name the user brought in into one safe to join onto a pack path. */
const sanitizeFileName = (fileName: string): string => {
  const cleaned = fileName.replace(UNSAFE_RE, '_').replace(/^\.+/, '').trim();
  return cleaned.length > 0 ? cleaned : 'audio';
};

/** The given name, or the first ` (2)`-style variant of it the pack does not already hold. */
const uniqueFileName = (fileName: string, taken: Set<string>): string => {
  if (!taken.has(fileName)) return fileName;
  const stem = stemOf(fileName);
  const ext = extensionOf(fileName);
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${stem} (${n}).${ext}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${stem}-${Date.now()}.${ext}`;
};

export { extensionOf, stemOf, namePrefixOf, canonicalTrackName, sanitizeFileName, uniqueFileName };
