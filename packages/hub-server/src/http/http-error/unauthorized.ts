/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const unauthorized = (message = 'Sign in first.'): HttpError => new HttpError(401, message);

export { unauthorized };
