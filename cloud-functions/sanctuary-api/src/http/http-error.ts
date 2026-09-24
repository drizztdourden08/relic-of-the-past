/* @layer root-config @kind logic */
/** A route throws one of these to end the request with a status and a one-line
 *  message; the router turns it into `{ error }`. Anything else thrown is a 500. */
class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const badRequest = (message: string): HttpError => new HttpError(400, message);
const unauthorized = (message = 'Sign in first.'): HttpError => new HttpError(401, message);
const forbidden = (message = 'Not allowed.'): HttpError => new HttpError(403, message);
const notFound = (message = 'Not found.'): HttpError => new HttpError(404, message);
const conflict = (message: string): HttpError => new HttpError(409, message);
const tooMany = (message = 'Too many requests. Try again later.'): HttpError => new HttpError(429, message);
const badGateway = (message: string): HttpError => new HttpError(502, message);

export { HttpError, badRequest, unauthorized, forbidden, notFound, conflict, tooMany, badGateway };
