/* @layer site-kit @kind types */
import type { DiscordRole, Group } from '@shared/hub/group-types';
import type { CreateGroupBody } from '@shared/hub/schemas/group-schemas';
import type { RightsEditorSlot } from '../../../site/site-definition.type';

type GroupEditorProps = {
  roles: readonly DiscordRole[];
  rolesAvailable: boolean;
  rightsEditors: readonly RightsEditorSlot[];
  group: Group | null;
  busy: boolean;
  onSave: (body: CreateGroupBody) => void;
  onCancel: () => void;
};

export type { GroupEditorProps };
