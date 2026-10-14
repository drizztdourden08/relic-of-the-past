/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { SCREENSHOT_FLAG } from '../automation/automation-flags.constants';
import { rotpAutomationFlags } from '../automation/rotp-automation-flags';
import { AUTO_STATE_FLAG } from './test-handlers.constants';

const autoStateOf = (raw: string | null): number | string | null => {
  if (raw === null) return null;
  return /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
};

const testArgs = (): { autoState: number | string | null; screenshot: string | null } => ({
  autoState: autoStateOf(rotpAutomationFlags.flagValue(AUTO_STATE_FLAG)),
  screenshot: rotpAutomationFlags.flagValue(SCREENSHOT_FLAG),
});

const testHandlers: HandlerGroup = {
  id: 'test',
  register: () => {
    handle('test:getArgs', testArgs);
  },
};

export { testHandlers };
