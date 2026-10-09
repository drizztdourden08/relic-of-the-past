/* @layer electron-main @kind logic */
import { app } from 'electron';
import { getMainWindow, handle } from '@drizztdourden08/brock-electron/main';
import { captureComposited } from '../automation/capture-composited';
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { GAME_SCREENSHOT_FLAG } from '../automation/automation-flags.constants';
import { rotpAutomationFlags } from '../automation/rotp-automation-flags';
import { AUTO_STATE_FLAG } from './test-handlers.constants';

const autoStateOf = (raw: string | null): number | string | null => {
  if (raw === null) return null;
  return /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
};

const testArgs = (): { autoState: number | string | null; screenshot: string | null } => ({
  autoState: autoStateOf(rotpAutomationFlags.flagValue(AUTO_STATE_FLAG)),
  screenshot: rotpAutomationFlags.flagValue(GAME_SCREENSHOT_FLAG),
});

const testHandlers: HandlerGroup = {
  id: 'test',
  register: () => {
    handle('test:getArgs', testArgs);
    handle('test:finish', async (_event, name) => {
      const win = getMainWindow();
      const path = win ? await captureComposited(win, name) : '';
      if (rotpAutomationFlags.hasFlag(GAME_SCREENSHOT_FLAG)) setImmediate(() => app.exit(0));
      return path;
    });
  },
};

export { testHandlers };
