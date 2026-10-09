/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';

const reportKindSchema = z.enum(['player', 'controller']);

export { reportKindSchema };
