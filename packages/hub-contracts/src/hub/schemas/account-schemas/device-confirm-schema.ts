/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { USER_CODE_HALF, USER_CODE_PATTERN } from './account-schemas.constants';

const withUserCodeDash = (code: string): string =>
  (code.length === USER_CODE_HALF * 2 ? `${code.slice(0, USER_CODE_HALF)}-${code.slice(USER_CODE_HALF)}` : code);

const deviceConfirmSchema = z.object({
  userCode: z
    .string()
    .trim()
    .toUpperCase()
    .transform(withUserCodeDash)
    .pipe(z.string().regex(USER_CODE_PATTERN, 'eight letters or digits')),
});

export { deviceConfirmSchema };
