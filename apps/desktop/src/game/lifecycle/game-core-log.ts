/* @layer bridge-wasm @kind logic */
import type { CoreLog } from '@drizztdourden08/brock-port-kit/renderer';
import { log } from '../../log-bus';

const gameCoreLog: CoreLog = (text, level) => {
  log.core(text, level === 'error' ? 'error' : 'info');
};

export { gameCoreLog };
