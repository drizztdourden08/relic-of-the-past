/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';

const queryFlag = (req: Request, name: string): boolean => {
  const value = req.query[name];
  return value !== undefined && value !== 'false' && value !== '0';
};

export { queryFlag };
