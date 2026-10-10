/* @layer shared-storage @kind logic */
import { TRACK_NUMBER_RE } from './msu-paths.constants';

const trackNumberOf = (name: string): number | null => {
  const digits = TRACK_NUMBER_RE.exec(name)?.[1];
  return digits === undefined ? null : Number.parseInt(digits, 10);
};

export { trackNumberOf };
