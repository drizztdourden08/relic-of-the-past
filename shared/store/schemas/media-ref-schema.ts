/* @layer shared-store @kind logic */
import { z } from 'zod';
import { MEDIA_KEY_PATTERN } from './schemas.constants';

const mediaRefSchema = z.object({
  key: z.string().regex(MEDIA_KEY_PATTERN, 'a key from the media upload'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export { mediaRefSchema };
