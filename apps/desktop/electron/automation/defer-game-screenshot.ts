/* @layer electron-main @kind logic */
import { GAME_LAUNCH_FLAGS, GAME_SCREENSHOT_FLAG, SCREENSHOT_FLAG } from './automation-flags.constants';

const hasFlag = (argv: readonly string[], flag: string): boolean => argv.some((arg) => arg === flag || arg.startsWith(`${flag}=`));

const deferGameScreenshot = (argv: string[]): void => {
  if (!GAME_LAUNCH_FLAGS.some((flag) => hasFlag(argv, flag))) return;
  const index = argv.findIndex((arg) => arg.startsWith(`${SCREENSHOT_FLAG}=`));
  if (index === -1) return;
  argv.splice(index, 1, `${GAME_SCREENSHOT_FLAG}=${argv[index]?.slice(SCREENSHOT_FLAG.length + 1) ?? ''}`);
};

export { deferGameScreenshot };
