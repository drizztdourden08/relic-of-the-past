/* @layer renderer-components @kind logic */
import { listSummary } from './list-summary';

const triggerSummary = (triggers: string[]): string => listSummary(triggers);

export { triggerSummary };
