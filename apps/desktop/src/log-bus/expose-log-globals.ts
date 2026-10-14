/* @layer renderer-lib @kind logic */
import { getEntries } from './get-entries';
import { subscribe } from './subscribe';

Object.assign(window, { __logEntries: getEntries, __logSubscribe: subscribe });
