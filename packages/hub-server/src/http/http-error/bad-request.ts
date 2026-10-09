/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const badRequest = (message: string): HttpError => new HttpError(400, message);

export { badRequest };
