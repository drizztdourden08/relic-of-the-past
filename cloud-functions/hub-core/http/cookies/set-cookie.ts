/* @layer hub-core @kind logic */
import type { Response } from '@google-cloud/functions-framework';
import type { CookieOptions } from './cookies.type';
import { serializeCookie } from './serialize-cookie';

const setCookie = (res: Response, name: string, value: string, options: CookieOptions): void => {
  res.append('Set-Cookie', serializeCookie(name, value, options));
};

export { setCookie };
