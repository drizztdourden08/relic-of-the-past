/* @layer shared-store @kind logic */
import { z } from 'zod';
import { MAX_WELCOME_CHARS } from './schemas.constants';

const welcomeSchema = z.object({
  welcome: z.string().trim().max(MAX_WELCOME_CHARS),
});

export { welcomeSchema };
