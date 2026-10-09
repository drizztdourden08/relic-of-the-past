/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const tooMany = (message = 'Too many requests. Try again later.'): HttpError => new HttpError(429, message);

export { tooMany };
