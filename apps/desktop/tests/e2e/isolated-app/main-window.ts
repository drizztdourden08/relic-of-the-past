/* @layer tests @kind helper */
import type { ElectronApplication, Page } from 'playwright';
import { MAIN_WINDOW_TIMEOUT_MS, SPLASH_PAGE, WINDOW_POLL_MS } from './isolated-app.constants';

const isMainWindow = (page: Page): boolean => !page.isClosed() && page.url() !== '' && !page.url().includes(SPLASH_PAGE);

const pause = (ms: number): Promise<void> => new Promise((done) => { setTimeout(done, ms); });

const waitForMainWindow = async (app: ElectronApplication, timeoutMs = MAIN_WINDOW_TIMEOUT_MS): Promise<Page> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const found = app.windows().find(isMainWindow);
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
