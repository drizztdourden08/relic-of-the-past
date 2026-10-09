/* @layer shared-hub @kind logic */
import type { HttpMethod } from './api-contract.type';

const route = <M extends HttpMethod, P extends string>(method: M, path: P) => ({ method, path }) as const;

export { route };
