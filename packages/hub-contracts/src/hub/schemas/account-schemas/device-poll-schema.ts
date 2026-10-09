/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { idSchema } from '../field-schemas';
import { MAX_POLL_SECRET_CHARS, MIN_POLL_SECRET_CHARS } from './account-schemas.constants';

const devicePollSchema = z.object({
  deviceId: idSchema,
  pollSecret: z.string().min(MIN_POLL_SECRET_CHARS).max(MAX_POLL_SECRET_CHARS),
});

export { devicePollSchema };
