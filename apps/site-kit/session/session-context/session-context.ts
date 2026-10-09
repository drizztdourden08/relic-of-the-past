/* @layer site-kit @kind logic */
import { createContext } from 'react';
import type { Session } from './session-context.type';

const SessionContext = createContext<Session | null>(null);

export { SessionContext };
