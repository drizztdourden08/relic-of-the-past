/* @layer sanctuary-site @kind component */
/**
 * The Groups section of the admin page: one row per group (the default one marked and
 * never deletable), New group, and the editor under the list for the group being made
 * or changed. Deleting a group asks once.
 */
import { useState } from 'react';
import { DEFAULT_GROUP_ID } from '@shared/sanctuary/group-types';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { Dialog } from '@ds/composites/Dialog';
import { SettingsSection } from '@ds/composites/SettingsSection';
import { Row } from '../../../components/Row/Row';
import { Chip } from '../../../components/Chip/Chip';
import type { GroupView } from '../../../api/types';
import type { GroupsState } from '../behavior/useGroups';
import { groupSummary } from '../behavior/group-summary';
import { GroupEditor } from './GroupEditor';

type GroupsSectionProps = {
  state: GroupsState;
};

/** Which group the editor holds: a new one, an existing one, or none. */
type Editing = { kind: 'new' } | { kind: 'edit'; group: GroupView } | null;

const GroupsSection = (props: GroupsSectionProps) => {
  const { state } = props;
  const { groups, loading, busy, error } = state;
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<GroupView | null>(null);

  const value = (group: GroupView) => (
    <Flex gap="sm" align="center" wrap>
      {group.id === DEFAULT_GROUP_ID && <Chip tone="gold">default</Chip>}
      <Text as="span" variant="caption">{groupSummary(group)}</Text>
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
export type { GroupsSectionProps };
