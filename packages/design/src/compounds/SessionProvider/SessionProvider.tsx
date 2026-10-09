/* @layer site-kit @kind component */
import { SessionContext } from '../../session/session-context';
import { useSession } from '../../hooks/useSession/useSession';
import type { SessionProviderProps } from './SessionProvider.type';

const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;
  const session = useSession();
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};

export { SessionProvider };
