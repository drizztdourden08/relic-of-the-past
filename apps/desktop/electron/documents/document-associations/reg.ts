/* @layer electron-main @kind logic */
import { execFileSync } from 'child_process';

const reg = (args: string[]): void => {
  execFileSync('reg.exe', args, { stdio: 'ignore', windowsHide: true });
};

export { reg };
