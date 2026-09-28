/* @layer store-site @kind hook */
/**
 * Opens an item's rotp:// install link and notices when nothing answered it. When the app
 * (or the browser's "open this app?" prompt) takes the link, the page loses focus; when the
 * page keeps its focus for a moment, no app handles the link and `missed` turns true.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatInstallLink } from '@shared/store/deep-link';

/** How long the page waits for the app or the browser's prompt to take focus. */
const ANSWER_MS = 1500;

const useOpenInApp = (itemId: string) => {
  const [missed, setMissed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const open = useCallback(() => {
    setMissed(false);
    let answered = false;
    const onLeave = () => { answered = true; };
    window.addEventListener('blur', onLeave, { once: true });
    document.addEventListener('visibilitychange', onLeave, { once: true });
    window.location.href = formatInstallLink({ itemId, version: null });
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onLeave);
      if (!answered && document.hasFocus()) setMissed(true);
    }, ANSWER_MS);
  }, [itemId]);

  return { missed, open };
};

export { useOpenInApp };
