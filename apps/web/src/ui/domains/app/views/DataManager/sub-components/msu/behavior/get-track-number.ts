/* @layer renderer-components @kind logic */
import { trackNumberOf } from '@shared/storage/msu-paths';

const getTrackNumber = (filename: string): number | null => trackNumberOf(filename);

export { getTrackNumber };
