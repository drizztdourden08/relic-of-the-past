/* @layer shared-hub @kind types */
import type { z } from 'zod';
import type { createGroupSchema } from './create-group-schema';
import type { groupRightsSchema } from './group-rights-schema';
import type { patchGroupSchema } from './patch-group-schema';
import type { setGroupsSchema } from './set-groups-schema';

type GroupRightsBody = z.infer<typeof groupRightsSchema>;
type CreateGroupBody = z.infer<typeof createGroupSchema>;
type PatchGroupBody = z.infer<typeof patchGroupSchema>;
type SetGroupsBody = z.infer<typeof setGroupsSchema>;

export type { GroupRightsBody, CreateGroupBody, PatchGroupBody, SetGroupsBody };
