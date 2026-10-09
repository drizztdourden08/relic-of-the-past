/* @layer renderer-components @kind logic */
import { trackNumberOf } from '@rotp/msu';

const getTrackNumber = (filename: string): number | null => trackNumberOf(filename);

export { getTrackNumber };
