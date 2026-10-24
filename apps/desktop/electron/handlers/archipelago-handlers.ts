/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerArchipelagoHandlers } from '../archipelago/ipc-handlers';

const archipelagoHandlers: HandlerGroup = {
  id: 'archipelago',
  register: () => registerArchipelagoHandlers(),
};

export { archipelagoHandlers };
