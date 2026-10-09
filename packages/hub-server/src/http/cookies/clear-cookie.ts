/* @layer hub-core @kind logic */
import type { Response } from '@google-cloud/functions-framework';
import { serializeCookie } from './serialize-cookie';

const clearCookie = (res: Response, name: string, path = '/'): void => {
  res.append('Set-Cookie', serializeCookie(name, '', { maxAgeSeconds: 0, path }));
};

export { clearCookie };
