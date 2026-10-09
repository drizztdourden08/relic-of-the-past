/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';

const queryParam = (req: Request, name: string): string | undefined => {
  const value = req.query[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

export { queryParam };
