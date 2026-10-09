/* @layer renderer-components @kind logic */
import { NUMBERED_RE, UNSAFE_RE } from './track-file-name.constants';

const namePrefixOf = (fileNames: string[], packName: string): string => {
  for (const name of fileNames) {
    const match = NUMBERED_RE.exec(name);
    if (match) return match[1];
  }
  return `${packName.replace(UNSAFE_RE, '_')}-`;
};

export { namePrefixOf };
