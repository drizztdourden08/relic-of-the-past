/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { rotpAutomationFlags } from '../automation/rotp-automation-flags';
import { registerDevicePermissions } from '../input';

const forwardDumpLayersConsole = (win: BrowserWindow): void => {
  if (!process.argv.some((arg) => arg.startsWith('--dump-layers='))) return;
  win.webContents.on('console-message', (event) => {
    console.log(`[renderer] ${event.message}`);
  });
};

const silenceHiddenLaunch = (win: BrowserWindow): void => {
  if (!rotpAutomationFlags.isHeadlessLaunch() || process.argv.includes('--sound')) return;
  win.webContents.setAudioMuted(true);
};

const onWindow = (win: BrowserWindow): void => {
  silenceHiddenLaunch(win);
  forwardDumpLayersConsole(win);
  registerDevicePermissions(win);
};

export { onWindow };
