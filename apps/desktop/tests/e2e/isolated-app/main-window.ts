/* @layer tests @kind helper */
import type { ElectronApplication, Page } from 'playwright';
import { MAIN_WINDOW_TIMEOUT_MS, SPLASH_PAGE, WINDOW_POLL_MS } from './isolated-app.constants';

type PageKind = 'splash' | 'main' | null;

const kindOf = (page: Page): PageKind => {
  if (page.isClosed()) return null;
  let url: URL;
  try {
    url = new URL(page.url());
  } catch {
    return null;
  }
  if (url.protocol === 'about:') return null;
  if (url.pathname.endsWith(`/${SPLASH_PAGE}`)) return 'splash';
  return 'main';
};

const pause = (ms: number): Promise<void> => new Promise((done) => { setTimeout(done, ms); });

const readyMainPage = (app: ElectronApplication): Page | undefined => {
  const pages = app.windows();
  if (pages.some((page) => kindOf(page) === 'splash')) return undefined;
  return pages.find((page) => kindOf(page) === 'main');
};

const waitForMainWindow = async (app: ElectronApplication, timeoutMs = MAIN_WINDOW_TIMEOUT_MS): Promise<Page> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const found = readyMainPage(app);
    if (found) {
      await found.waitForLoadState('domcontentloaded');
      return found;
    }
    await pause(WINDOW_POLL_MS);
  }
  const seen = app.windows().map((page) => (page.isClosed() ? 'closed' : page.url()));
  throw new Error(`no main window after ${timeoutMs} ms (windows seen: ${JSON.stringify(seen)})`);
};

export { waitForMainWindow };
