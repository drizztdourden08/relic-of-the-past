/* @layer electron-main @kind logic */
import { app } from 'electron';
import { whenRevealed } from '@drizztdourden08/brock-electron/main';
import { GAME_SCREENSHOT_FLAG } from './automation-flags.constants';
import {
  GAME_SCREENSHOT_DEADLINE_MS, GAME_SCREENSHOT_FAILED_EXIT_CODE, GAME_SCREENSHOT_REVEAL_MS,
} from './game-screenshot-watchdog.constants';

const giveUp = (reason: string): void => {
  console.error(`[game-screenshot] ${reason}; exiting`);
  app.exit(GAME_SCREENSHOT_FAILED_EXIT_CODE);
};

const armGameScreenshotWatchdog = (argv: readonly string[]): void => {
  if (!argv.some((arg) => arg.startsWith(`${GAME_SCREENSHOT_FLAG}=`))) return;
  let revealed = false;
  void whenRevealed().then(() => { revealed = true; });
  setTimeout(() => {
    if (!revealed) giveUp(`the app did not finish booting within ${GAME_SCREENSHOT_REVEAL_MS / 1000} s`);
  }, GAME_SCREENSHOT_REVEAL_MS).unref();
  setTimeout(() => giveUp(`no game screenshot within ${GAME_SCREENSHOT_DEADLINE_MS / 1000} s`), GAME_SCREENSHOT_DEADLINE_MS).unref();
};

export { armGameScreenshotWatchdog };
