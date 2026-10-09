/* @layer site-kit @kind component */
import { useEffect } from 'react';
import { navigate } from './useLocation';
import type { RedirectProps } from './Redirect.type';

const Redirect = (props: RedirectProps) => {
  const { to } = props;
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
};

export { Redirect };
