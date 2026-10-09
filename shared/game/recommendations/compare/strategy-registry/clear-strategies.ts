/* @layer shared-game @kind logic */
import { registeredStrategies } from './registered-strategies';

const clearStrategies = (): void => { registeredStrategies.clear(); };

export { clearStrategies };
