/* @layer shared-store @kind logic */
import { z } from 'zod';

const containerSchema = z.enum(['msul', 'rsp', 'rlang']);

export { containerSchema };
