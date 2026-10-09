/* @layer renderer-lib @kind logic */
import { getEntries } from './get-entries';
import { log } from './log';
import { subscribe } from './subscribe';

const installGlobalHandlers = (): void => {
  window.addEventListener('error', (e) => {
    if (e.error instanceof WebAssembly.RuntimeError) {
      e.preventDefault();
      return;
    }
    log.error(`${e.message} (${e.filename}:${e.lineno})`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    log.error(`Unhandled rejection: ${e.reason}`);
  });
};

installGlobalHandlers();

Object.assign(window, { __logEntries: getEntries, __logSubscribe: subscribe });
