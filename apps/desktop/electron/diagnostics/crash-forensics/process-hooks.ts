/* @layer electron-main @kind logic */
/**
 * Node-level failure hooks for the main process. `uncaughtExceptionMonitor` rather
 * than `uncaughtException`: the monitor observes without counting as a handler, so
 * Electron's own handling (its error dialog) is left exactly as it was. It also sees
 * an unhandled promise rejection, because Node's default mode escalates one into an
 * uncaught exception and the monitor's `origin` says which it was. Registering an
 * `unhandledRejection` listener instead would swallow that escalation. Every line is
 * written synchronously because there may be no next tick.
 */
import { noteSync, stackOf } from './forensics-log';

const installProcessHooks = (): void => {
  process.on('uncaughtExceptionMonitor', (error, origin) => {
    noteSync('error', `${origin} ${stackOf(error)}`);
  });
  process.on('exit', (code) => {
    noteSync('info', `process exit code=${code}`);
  });
};

export { installProcessHooks };
