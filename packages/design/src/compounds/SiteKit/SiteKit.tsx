/* @layer site-kit @kind component */
import { SessionProvider } from '../SessionProvider/SessionProvider';
import { SiteContext } from '../../site/site-context';
import type { SiteKitProps } from './SiteKit.type';

const SiteKit = (props: SiteKitProps) => {
  const { site, children } = props;
  return (
    <SiteContext.Provider value={site}>
      <SessionProvider>{children}</SessionProvider>
    </SiteContext.Provider>
  );
};

export { SiteKit };
export type { SiteKitProps } from './SiteKit.type';
