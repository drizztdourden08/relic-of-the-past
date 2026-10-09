/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import type { Jar } from './session-jar.type';

const pendingJars = new WeakMap<Request, Jar>();

export { pendingJars };
