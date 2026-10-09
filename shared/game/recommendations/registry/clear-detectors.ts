/* @layer shared-game @kind logic */
import { registeredDetectors } from './registered-detectors';

const clearDetectors = (): void => { registeredDetectors.clear(); };

export { clearDetectors };
