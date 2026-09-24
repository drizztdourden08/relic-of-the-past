/* @layer root-config @kind logic */
/** Runs a request body through its zod schema and turns the first failure into
 *  a 400 with a one-line message naming the field. */
import type { ZodTypeAny, output } from 'zod';
import { badRequest } from './http-error';

const parseBody = <S extends ZodTypeAny>(schema: S, body: unknown): output<S> => {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data as output<S>;
  const issue = result.error.issues[0];
  const where = issue?.path.length ? issue.path.join('.') : 'body';
  throw badRequest(`Invalid ${where}: ${issue?.message ?? 'malformed request'}`);
};

export { parseBody };
