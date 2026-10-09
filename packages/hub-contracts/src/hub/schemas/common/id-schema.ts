/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { ID_PATTERN, MAX_ID_CHARS } from './common.constants';

const idSchema = z.string().min(1).max(MAX_ID_CHARS).regex(ID_PATTERN);

export { idSchema };
