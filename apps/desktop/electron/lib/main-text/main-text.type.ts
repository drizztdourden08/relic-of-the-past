/* @layer electron-main @kind types */
import type { MainContext } from '@drizztdourden08/brock-electron/main';

interface MainContextHolder {
  current: MainContext | null;
}

export type { MainContextHolder };
