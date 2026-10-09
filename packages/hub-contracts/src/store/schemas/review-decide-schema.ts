/* @layer shared-store @kind logic */
import { z } from 'zod';
import { MAX_REVIEW_NOTE_CHARS } from './schemas.constants';

const reviewDecideSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    note: z.string().trim().max(MAX_REVIEW_NOTE_CHARS).default(''),
  })
  .refine((body) => body.decision === 'approve' || body.note.length > 0, {
    message: 'a rejection needs a note for the author',
    path: ['note'],
  });

export { reviewDecideSchema };
