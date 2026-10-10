/* @layer renderer-components @kind logic */
import { NUMBERED_RE, UNSAFE_RE } from './track-file-name.constants';

const namePrefixOf = (fileNames: string[], packName: string): string => {
  for (const name of fileNames) {
    const prefix = NUMBERED_RE.exec(name)?.[1];
    if (prefix !== undefined) return prefix;
  }
  return `${packName.replace(UNSAFE_RE, '_')}-`;
};

export { namePrefixOf };
