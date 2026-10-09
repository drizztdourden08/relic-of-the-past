/* @layer site-kit @kind hook */
import { useContext } from 'react';
import { SessionContext } from './session-context';
import type { Session } from './session-context.type';

const useSessionContext = (): Session => {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSessionContext: no SessionProvider above');
  return session;
};

export { useSessionContext };
