/* @layer renderer-components @kind logic */
import { newId } from '@drizztdourden08/brock-core';

const nodeId = (prefix: string): string => `${prefix}-${newId().slice(0, 6)}`;

export { nodeId };
