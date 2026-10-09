/* @layer shared-hub @kind logic */
import { createGroupSchema } from './create-group-schema';

const patchGroupSchema = createGroupSchema.partial().refine((body) => Object.keys(body).length > 0, 'nothing to change');

export { patchGroupSchema };
