/* @layer site-kit @kind component */
import { useState } from 'react';
import { DEFAULT_GROUP_ID } from '@shared/hub/group-types';
import { Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { Dialog, SettingsSection } from '@drizztdourden08/tessera/composites';
import { Row } from '../../../components/Row/Row';
import { Chip } from '../../../components/Chip/Chip';
import type { GroupView } from '../../../api/hub-responses.type';
import { groupSummary } from '../behavior/group-summary';
import { GroupEditor } from './GroupEditor';
import { useDiscordRoles } from '../behavior/useDiscordRoles';
import { useSiteDefinition } from '../../../site/site-context';
import type { Editing, GroupsSectionProps } from './GroupsSection.type';

const GroupsSection = (props: GroupsSectionProps) => {
  const { state } = props;
  const { groups, loading, busy, error } = state;
  const { rightsEditors } = useSiteDefinition();
  const models = rightsEditors.map((slot) => slot.model);
  const discord = useDiscordRoles();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<GroupView | null>(null);

  const value = (group: GroupView) => (
    <Flex gap="sm" align="center" wrap>
      {group.id === DEFAULT_GROUP_ID && <Chip tone="gold">default</Chip>}
      <Text as="span" variant="caption">{groupSummary(group, discord.byId, models)}</Text>
    </Flex>
  );
  const action = (group: GroupView) => (
    <>
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => setEditing({ kind: 'edit', group })}>Edit</Button>
      {group.id !== DEFAULT_GROUP_ID && (
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDeleting(group)}>Delete</Button>
      )}
    </>
  );

  const editorGroup = editing?.kind === 'edit' ? editing.group : null;

  return (
    <SettingsSection title="Groups" description="What each group sees. A Discord role fills a group; an admin can add people by hand.">
      {loading && <Text as="p" variant="caption">Loading groups</Text>}
      {groups.map((group) => <Row key={group.id} label={group.name} value={value(group)} action={action(group)} />)}
      {editing
        ? (
          <GroupEditor
            key={editorGroup?.id ?? 'new'}
            group={editorGroup}
            roles={discord.roles}
            rolesAvailable={discord.available}
            rightsEditors={rightsEditors}
            busy={busy}
            onSave={(body) => void state.save(editorGroup?.id ?? null, body).then((ok) => { if (ok) setEditing(null); })}
            onCancel={() => setEditing(null)}
          />
        )
        : (
          <Flex>
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => setEditing({ kind: 'new' })}>+ New group</Button>
          </Flex>
        )}
      {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
      <Dialog
        open={deleting !== null}
        title="Delete group"
        message={deleting ? `Delete the group "${deleting.name}"? Its members lose what only this group gave them.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleting) void state.remove(deleting.id); setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </SettingsSection>
  );
};

export { GroupsSection };
