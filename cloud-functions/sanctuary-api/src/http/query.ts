/* @layer root-config @kind logic */
/** One query parameter as a string, or undefined; a repeated parameter counts as absent. */
import type { Request } from '@google-cloud/functions-framework';

const queryParam = (req: Request, name: string): string | undefined => {
  const value = req.query[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

/** `?flag` and `?flag=1` and `?flag=true` all read as set. */
const queryFlag = (req: Request, name: string): boolean => {
  const value = req.query[name];
  return value !== undefined && value !== 'false' && value !== '0';
};

export { queryParam, queryFlag };
