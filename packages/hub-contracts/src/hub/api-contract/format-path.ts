/* @layer shared-hub @kind logic */
import type { PathParams } from './api-contract.type';

const formatPath = (path: string, params: PathParams = {}): string =>
  path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
    const value = params[name];
    if (value === undefined) throw new Error(`formatPath: missing param "${name}" for ${path}`);
    return encodeURIComponent(String(value));
  });

export { formatPath };
