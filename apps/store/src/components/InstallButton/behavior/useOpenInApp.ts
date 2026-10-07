/* @layer store-site @kind hook */
/**
 * Opens an item's install link (relic-of-the-past://) and notices when nothing answered it. When the app
 * (or the browser's "open this app?" prompt) takes the link, the page loses focus; when the
 * page keeps its focus for a moment, no app handles the link and a toast says so.
 */
import { useCallback, useEffect, useRef } from 'react';
import { formatInstallLink } from '@shared/store/deep-link';
import { showToast } from '@site-kit/toast/toast-store';

/** How long the page waits for the app or the browser's prompt to take focus. */
const ANSWER_MS = 1500;
const NOT_ANSWERED = 'Nothing opened. Installing from the store needs the latest Relic of the Past on this computer; use Download for now.';
const NOT_ANSWERED_MS = 10000;

const useOpenInApp = (itemId: string) => {
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  return useCallback(() => {
    let answered = false;
    const onLeave = () => { answered = true; };
    window.addEventListener('blur', onLeave, { once: true });
    document.addEventListener('visibilitychange', onLeave, { once: true });
    window.location.href = formatInstallLink({ itemId, version: null });
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onLeave);
      if (!answered && document.hasFocus()) showToast({ message: NOT_ANSWERED, variant: 'warning', duration: NOT_ANSWERED_MS });
    }, ANSWER_MS);
  }, [itemId]);
};

export { useOpenInApp };
