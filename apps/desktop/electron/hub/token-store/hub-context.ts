/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';

const hubContext: { current: MainContext | null } = { current: null };

export { hubContext };
