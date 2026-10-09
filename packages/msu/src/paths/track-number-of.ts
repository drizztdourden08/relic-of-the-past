/* @layer shared-storage @kind logic */
import { TRACK_NUMBER_RE } from './msu-paths.constants';

const trackNumberOf = (name: string): number | null => {
  const match = name.match(TRACK_NUMBER_RE);
  return match === null ? null : Number.parseInt(match[1], 10);
};

export { trackNumberOf };
