/* @layer site-kit @kind logic */
import type { Group } from '@rotp/hub-contracts';
import type { RightsEditorSlot } from '../../../site/site-definition.type';
import { emptyRights } from './empty-rights';
import type { GroupDraft } from './group-draft.type';

const draftOf = (group: Group | null, editors: readonly RightsEditorSlot[]): GroupDraft => ({
  name: group?.name ?? '',
  roleId: group?.discordRoleId ?? '',
  rights: group?.rights ?? emptyRights(editors),
});

export { draftOf };
