/* @layer renderer-components @kind logic */
import { newId } from '@shared/storage/id';

const nodeId = (prefix: string): string => `${prefix}-${newId().slice(0, 6)}`;

export { nodeId };
