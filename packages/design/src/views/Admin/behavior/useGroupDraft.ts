/* @layer site-kit @kind hook */
import { useState } from 'react';
import type { Group, GroupRights } from '@rotp/hub-contracts';
import { createGroupSchema } from '@rotp/hub-contracts';
import type { RightsEditorSlot } from '../../../site/site-definition.type';
import { draftOf } from './draft-of';
import { problemOf } from './problem-of';

const useGroupDraft = (group: Group | null, editors: readonly RightsEditorSlot[]) => {
  const [start] = useState(() => draftOf(group, editors));
  const [name, setName] = useState(start.name);
  const [roleId, setRoleId] = useState(start.roleId);
  const [rights, setRights] = useState<GroupRights>(start.rights);

  const parsed = createGroupSchema.safeParse({ name, discordRoleId: roleId.trim() || null, rights });
  return { name, setName, roleId, setRoleId, rights, setRights, parsed, problem: problemOf(parsed) };
};

export { useGroupDraft };
