/* @layer electron-main @kind logic */
/**
 * Crash forensics: everything that turns a silent death into a trace in
 * Data/debug/main-console.log. Called once, before app ready, because the crash
 * reporter must be running before any child process exists. Observation only: no
 * handler changes what the app does, and nothing leaves the machine (the reporter is
 * local, upload off, no submit URL; minidumps land under app.getPath('crashDumps')).
 */
import { app, crashReporter } from 'electron';
import { note, stackOf } from './forensics-log';
import { installProcessHooks } from './process-hooks';
import { installQuitHooks } from './quit-hooks';
import { installProcessGoneHooks } from './process-gone-hooks';
import { startMemoryHeartbeat, HEARTBEAT_MS } from './memory-heartbeat';

const startLocalCrashReporter = (): boolean => {
  try {
    crashReporter.start({ submitURL: '', uploadToServer: false, compress: false });
    return true;
  } catch (error) {
    note('warn', `crash reporter not started: ${stackOf(error)}`);
    return false;
  }
};

const noteArmed = (isReporterStarted: boolean): void => {
  const { electron, chrome, node } = process.versions;
  note('info', `armed pid=${process.pid} electron=${electron} chrome=${chrome} node=${node} heartbeat=${HEARTBEAT_MS / 1000}s`);
  note('info', `crash dumps: ${isReporterStarted ? app.getPath('crashDumps') : 'reporter unavailable'}`);
};

const installCrashForensics = (): void => {
  const isReporterStarted = startLocalCrashReporter();
  installProcessHooks();
  installQuitHooks();
  installProcessGoneHooks();
  // Lines written before initPaths() are held by the log module and flushed with the
  // first line that reaches the disk, so this can run ahead of main's own ready work.
  void app.whenReady().then(() => {
    noteArmed(isReporterStarted);
    startMemoryHeartbeat();
  });
};

export { installCrashForensics };
