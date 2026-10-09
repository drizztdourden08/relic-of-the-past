/* @layer electron-main @kind logic */
import { app } from 'electron';
import { handOffLaunchLink } from '../link-handoff';

const quitIfHandedOff = async (): Promise<boolean> => {
  if (!(await handOffLaunchLink())) return false;
  app.exit(0);
  return true;
};

export { quitIfHandedOff };
