/* @layer site-kit @kind component */
import { Link } from '@drizztdourden08/tessera/primitives';
import { navigate } from '../../hooks/useLocation';
import type { AppLinkProps } from './AppLink.type';

const goTo = (href: string) => navigate(href);

const AppLink = (props: AppLinkProps) => {
  const { to, ...rest } = props;
  return <Link {...rest} href={to} navigate={goTo} />;
};

export { AppLink };
export type { AppLinkProps } from './AppLink.type';
