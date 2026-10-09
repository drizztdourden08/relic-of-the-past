/* @layer renderer-components @kind logic */
import { UNSAFE_RE } from './track-file-name.constants';

const sanitizeFileName = (fileName: string): string => {
  const cleaned = fileName.replace(UNSAFE_RE, '_').replace(/^\.+/, '').trim();
  return cleaned.length > 0 ? cleaned : 'audio';
};

export { sanitizeFileName };
