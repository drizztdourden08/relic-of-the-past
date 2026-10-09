/* @layer electron-main @kind logic */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { bestEffort } from './best-effort';
import { mainLogPath } from './main-log-path';
import { mainLogState } from './main-log-state';

const openMainLog = (): void => {
  if (mainLogState.isOpen) return;
  mainLogState.isOpen = true;
  const { pending } = mainLogState;
  bestEffort(() => {
    mkdirSync(dirname(mainLogPath()), { recursive: true });
    writeFileSync(mainLogPath(), pending.length ? `${pending.join('\n')}\n` : '', 'utf-8');
  });
  pending.length = 0;
};

export { openMainLog };
