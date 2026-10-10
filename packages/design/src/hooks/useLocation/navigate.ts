/* @layer site-kit @kind logic */
import { NAVIGATE_EVENT } from './location.constants';

const navigate = (path: string, options: { replace?: boolean } = {}) => {
  if (options.replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

export { navigate };
