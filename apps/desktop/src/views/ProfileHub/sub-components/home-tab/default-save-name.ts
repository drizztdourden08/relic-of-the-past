/* @layer renderer-components @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';

const defaultSaveName = (): string => `Save - ${formatDate(Date.now(), 'datetime')}`;

export { defaultSaveName };
