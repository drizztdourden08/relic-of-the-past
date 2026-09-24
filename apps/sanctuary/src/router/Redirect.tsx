/* @layer sanctuary-site @kind component */
/** Renders nothing and replaces the current entry with `to` once mounted. */
import { useEffect } from 'react';
import { navigate } from './useLocation';

type RedirectProps = { to: string };

const Redirect = (props: RedirectProps) => {
  const { to } = props;
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
};

export { Redirect };
