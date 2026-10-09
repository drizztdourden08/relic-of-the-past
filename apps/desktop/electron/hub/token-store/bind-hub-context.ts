/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { hubContext } from './hub-context';

const bindHubContext = (ctx: MainContext): void => {
  hubContext.current = ctx;
};

export { bindHubContext };
