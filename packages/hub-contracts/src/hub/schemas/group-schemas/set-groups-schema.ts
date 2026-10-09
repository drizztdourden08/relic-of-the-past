/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { idSchema } from '../common';
import { MAX_GROUPS_PER_PERSON } from './group-schemas.constants';

const setGroupsSchema = z.object({
  groupIds: z.array(idSchema).max(MAX_GROUPS_PER_PERSON).transform((ids) => Array.from(new Set(ids))),
});

export { setGroupsSchema };
