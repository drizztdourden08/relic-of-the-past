/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const notFound = (message = 'Not found.'): HttpError => new HttpError(404, message);

export { notFound };
