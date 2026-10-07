/* @layer site-kit @kind component */
/** The root of a site on the kit: its definition for every kit piece, and the session. */
import type { ReactNode } from 'react';
import { SessionProvider } from '../session/SessionProvider';
import { SiteContext } from './site-context';
import type { SiteDefinition } from './site-definition.type';

type SiteKitProps = {
  site: SiteDefinition;
  children: ReactNode;
};

const SiteKit = (props: SiteKitProps) => {
  const { site, children } = props;
  return (
    <SiteContext.Provider value={site}>
      <SessionProvider>{children}</SessionProvider>
    </SiteContext.Provider>
  );
};

export { SiteKit };
export type { SiteKitProps };
