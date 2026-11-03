/* @layer renderer-lib @kind logic */
import { getEntries } from './get-entries';
import { subscribe } from './subscribe';

if (typeof window !== 'undefined') {
  Object.assign(window, { __logEntries: getEntries, __logSubscribe: subscribe });
}
