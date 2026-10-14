/* @layer renderer-components @kind logic */
import { extensionOf, sanitizeFileName } from './track-file-name';

const renameProblem = (from: string, to: string, taken: Set<string>): string | null => {
  if (to.length === 0) return 'Give the file a name.';
  if (to !== sanitizeFileName(to)) return 'That name has characters a file name cannot hold.';
  if (extensionOf(to) !== extensionOf(from)) return 'Keep the extension, because it says how the audio is encoded.';
  if (taken.has(to)) return `The pack already has a file called "${to}".`;
  return null;
};

export { renameProblem };
