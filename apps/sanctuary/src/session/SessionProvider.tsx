/* @layer sanctuary-site @kind component */
import type { ReactNode } from 'react';
import { SessionContext } from './session-context';
import { useSession } from './useSession';

type SessionProviderProps = { children: ReactNode };

const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;
  const session = useSession();
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};

export { SessionProvider };
