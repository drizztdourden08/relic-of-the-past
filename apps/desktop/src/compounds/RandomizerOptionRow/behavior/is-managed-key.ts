/* @layer renderer-components @kind logic */
import { MANAGED_KEY_TESTS } from './managed-keys.constants';

const isManagedKey = (key: string): boolean => MANAGED_KEY_TESTS.some((test) => test(key));

export { isManagedKey };
