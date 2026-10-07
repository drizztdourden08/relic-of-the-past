/* @layer site-kit @kind component */
/**
 * The form for one group: its name, the Discord role that fills it, and one rights section
 * per site, each drawn by that site's own editor. A single site's section stands without a
 * heading. The body is checked against the shared schema, so what Save sends is what the
 * API accepts; the rights of a site with no editor here are kept as they were.
 */
import { Fragment, useState } from 'react';
import type { DiscordRole, Group, GroupRights } from '@shared/hub/group-types';
import { createGroupSchema } from '@shared/hub/schemas/group-schemas';
import type { CreateGroupBody } from '@shared/hub/schemas/group-schemas';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import type { RightsEditorSlot } from '../../../site/site-definition.type';
import { RolePicker } from './RolePicker';

type GroupEditorProps = {
  /** The server's roles; empty with `rolesAvailable` false falls back to typing an id. */
  roles: readonly DiscordRole[];
  rolesAvailable: boolean;
  /** One section per site whose rights this page sets. */
  rightsEditors: readonly RightsEditorSlot[];
  /** The group being edited, or null for a new one. */
  group: Group | null;
  busy: boolean;
  onSave: (body: CreateGroupBody) => void;
  onCancel: () => void;
};

const ROLE_HINT = 'Right-click the role in Discord, Copy Role ID';
/** The shared schema's cap on a group name. */
const NAME_MAX_CHARS = 40;

/** A new group starts with an empty list on every site this page edits. */
const emptyRights = (editors: readonly RightsEditorSlot[]): GroupRights =>
  Object.fromEntries(editors.map(({ model }) => [model.site, []]));

const GroupEditor = (props: GroupEditorProps) => {
  const { group, busy, onSave, onCancel, roles, rolesAvailable, rightsEditors } = props;
  const [name, setName] = useState(group?.name ?? '');
  const [roleId, setRoleId] = useState(group?.discordRoleId ?? '');
  const [rights, setRights] = useState<GroupRights>(group?.rights ?? emptyRights(rightsEditors));
  const titled = rightsEditors.length > 1;

  const parsed = createGroupSchema.safeParse({ name, discordRoleId: roleId.trim() || null, rights });
  const problem = parsed.success ? null : parsed.error.issues[0]?.message ?? 'Check the fields.';

  return (
    <Stack
      as="form"
      gap="sm"
      align="stretch"
      className="group-editor"
      onSubmit={(event) => { event.preventDefault(); if (parsed.success) onSave(parsed.data); }}
    >
      <Text as="span" variant="caption" className="group-editor__title">
        {group ? `editing · ${group.name}` : 'new group'}
      </Text>
      <Field label="Name">
        <TextInput value={name} maxLength={NAME_MAX_CHARS} onChange={(event) => setName(event.target.value)} placeholder="Artists" />
      </Field>
      {rolesAvailable
        ? (
          <Field label="Discord role">
            <RolePicker roles={roles} value={roleId} onChange={setRoleId} />
          </Field>
        )
        : (
          <Field label="Discord role id" hint={ROLE_HINT}>
            <TextInput value={roleId} inputMode="numeric" onChange={(event) => setRoleId(event.target.value)} placeholder="no Discord role" />
          </Field>
        )}
      {rightsEditors.map(({ model, Editor }) => (
        <Fragment key={model.site}>
          {titled && <Text as="span" variant="caption" className="group-editor__title">{model.site}</Text>}
          <Editor
            value={rights[model.site] ?? []}
            onChange={(next) => setRights((current) => ({ ...current, [model.site]: next }))}
          />
        </Fragment>
      ))}
      {name.trim() && problem && <Text as="p" variant="caption" role="alert">{problem}</Text>}
      <Flex gap="sm">
        <Button type="submit" variant="primary" size="sm" disabled={busy || !parsed.success}>Save</Button>
        <Button type="button" variant="tertiary" size="sm" disabled={busy} onClick={onCancel}>Cancel</Button>
      </Flex>
    </Stack>
  );
};

export { GroupEditor };
export type { GroupEditorProps };
