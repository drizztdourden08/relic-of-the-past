/* @layer site-kit @kind component */
import { useState } from 'react';
import { Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { Dialog, ListItemList, SettingsSection } from '@drizztdourden08/tessera/composites';
import type { GroupView } from '@rotp/hub-client';
import { groupSummary } from '../behavior/group-summary';
import { GroupEditor } from './GroupEditor';
import { GroupRow } from './GroupRow';
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

  const editGroup = (group: GroupView) => setEditing({ kind: 'edit', group });
  const editorGroup = editing?.kind === 'edit' ? editing.group : null;

  return (
    <SettingsSection title="Groups" description="What each group sees. A Discord role fills a group; an admin can add people by hand.">
      {loading && <Text as="p" variant="caption">Loading groups</Text>}
      <ListItemList label="Groups">
        {groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            summary={groupSummary(group, discord.byId, models)}
            busy={busy}
            onEdit={editGroup}
            onDelete={setDeleting}
          />
        ))}
      </ListItemList>
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
