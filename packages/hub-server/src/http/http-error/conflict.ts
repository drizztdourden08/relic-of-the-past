/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const conflict = (message: string): HttpError => new HttpError(409, message);

export { conflict };
