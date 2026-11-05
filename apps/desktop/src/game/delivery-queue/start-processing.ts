/* @layer bridge-wasm @kind logic */
import { startProcessing as startSharedProcessing } from '@rotp/randomizer';
import { log } from '../../log-bus';

const startProcessing = (): void => {
  startSharedProcessing((message, level) => log.app(message, level));
};

export { startProcessing };
