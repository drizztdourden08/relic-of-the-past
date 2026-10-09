/* @layer site-kit @kind types */
import type { DiscordRole, Group, CreateGroupBody } from '@rotp/hub-contracts';
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
