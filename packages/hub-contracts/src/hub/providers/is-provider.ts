/* @layer shared-hub @kind logic */
import { PROVIDERS } from './providers.constants';
import type { Provider } from './providers.type';

const isProvider = (value: unknown): value is Provider =>
  typeof value === 'string' && (PROVIDERS as readonly string[]).includes(value);

export { isProvider };
