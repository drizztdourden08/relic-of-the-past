/* @layer renderer-components @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';

const formatTime = (timestamp: number): string => formatDate(timestamp, 'time', { length: 'medium' });

export { formatTime };
