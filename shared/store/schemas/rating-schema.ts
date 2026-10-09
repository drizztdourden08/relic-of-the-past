/* @layer shared-store @kind logic */
import { z } from 'zod';

const ratingSchema = z.object({
  stars: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

export { ratingSchema };
