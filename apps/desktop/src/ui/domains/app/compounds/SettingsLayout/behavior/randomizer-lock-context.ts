/* @layer renderer-components @kind logic */
import { createContext } from 'react';

const RandomizerLockContext = createContext<readonly string[]>([]);

export { RandomizerLockContext };
