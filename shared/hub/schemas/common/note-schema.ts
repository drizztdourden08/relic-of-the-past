/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { HUB_LIMITS } from '../../limits';

const noteSchema = z.string().trim().max(HUB_LIMITS.noteMaxChars);

export { noteSchema };
