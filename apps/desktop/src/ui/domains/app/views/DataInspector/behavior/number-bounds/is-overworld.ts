/* @layer renderer-app @kind logic */
import { OVERWORLD_KIND } from '../../DataInspector.constants';

const isOverworld = (record: unknown): boolean =>
  typeof record === 'object' && record !== null
  && (record as { kind?: unknown }).kind === OVERWORLD_KIND;

export { isOverworld };
