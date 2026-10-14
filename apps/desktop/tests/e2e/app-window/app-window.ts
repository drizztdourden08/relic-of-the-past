/* @layer tests @kind helper */
import type { ElectronApplication, Page } from 'playwright';
import { APP_WINDOW_POLL_MS, APP_WINDOW_TIMEOUT_MS, SPLASH_PAGE, WIDGET_QUERY_KEY } from './app-window.constants';

type PageKind = 'splash' | 'widget' | 'app' | null;

const kindOf = (page: Page): PageKind => {
  let url: URL;
  try {
    url = new URL(page.url());
  } catch {
    return null;
  }
  if (url.protocol === 'about:') return null;
  if (SPLASH_PAGE.test(url.pathname)) return 'splash';
  return url.searchParams.has(WIDGET_QUERY_KEY) ? 'widget' : 'app';
};

const pause = (ms: number): Promise<void> => new Promise((resolve) => { setTimeout(resolve, ms); });

const readyAppPage = (app: ElectronApplication): Page | undefined => {
  const pages = app.windows();
  if (pages.some((page) => kindOf(page) === 'splash')) return undefined;
  return pages.find((page) => kindOf(page) === 'app');
};

const appWindow = async (app: ElectronApplication, timeoutMs = APP_WINDOW_TIMEOUT_MS): Promise<Page> => {
  const deadline = Date.now() + timeoutMs;
  let page = readyAppPage(app);
  while (page === undefined) {
    if (Date.now() >= deadline) throw new Error(`The app window was not ready after ${timeoutMs} ms`);
    await pause(APP_WINDOW_POLL_MS);
    page = readyAppPage(app);
  }
  await page.waitForLoadState('domcontentloaded');
  return page;
};

export { appWindow };
