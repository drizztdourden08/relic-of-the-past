/* @layer site-kit @kind logic */
import type { MouseEvent } from 'react';
import { navigate } from './useLocation';

const isPlainClick = (event: MouseEvent) =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const routeAnchorClick = (event: MouseEvent<HTMLElement>) => {
  if (!isPlainClick(event) || !(event.target instanceof Element)) return;
  const anchor = event.target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return;
  event.preventDefault();
  navigate(`${url.pathname}${url.search}${url.hash}`);
};

export { routeAnchorClick };
