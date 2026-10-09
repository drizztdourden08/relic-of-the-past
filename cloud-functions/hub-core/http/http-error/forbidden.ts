/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const forbidden = (message = 'Not allowed.'): HttpError => new HttpError(403, message);

export { forbidden };
