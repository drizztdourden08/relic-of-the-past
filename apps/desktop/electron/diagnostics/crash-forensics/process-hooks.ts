/* @layer electron-main @kind logic */
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
