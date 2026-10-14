/* @layer bridge-wasm @kind logic */
import type { CoreLog } from '@drizztdourden08/brock-port-kit/renderer';
import { log } from '../../log-bus';

const gameCoreLog: CoreLog = (text, level) => {
  if (level === 'error') {
    log.core(text, 'error');
    return;
  }
  log.core(text);
  if (text.startsWith('[TRACE]')) console.log(text);
};

export { gameCoreLog };
