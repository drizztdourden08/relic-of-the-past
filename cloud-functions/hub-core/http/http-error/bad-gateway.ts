/* @layer hub-core @kind logic */
import { HttpError } from './http-error';

const badGateway = (message: string): HttpError => new HttpError(502, message);

export { badGateway };
