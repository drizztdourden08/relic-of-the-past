/* @layer renderer-app @kind logic */
import { defaultIdRefDisplay } from './default-id-ref-display';

const resolveRecordLabel = (id: string): string => defaultIdRefDisplay(id) ?? id;

export { resolveRecordLabel };
