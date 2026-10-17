/* @layer renderer-components @kind component */
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { InputProfileItem } from './InputProfileItem';
import { useProfileEditing } from './useProfileEditing';
import type { InputProfileListProps } from './controls.type';

const InputProfileList = (props: InputProfileListProps) => {
  const { profiles, activeId, initialEditId, onSelect, onDelete, onRename } = props;
  const { editingId, editValue, inputRef, setEditValue, startEditing, commitEdit, cancelEdit } =
    useProfileEditing({ profiles, initialEditId, onRename });

  if (profiles.length === 0) return <EmptyState message="No profiles yet" />;

  return profiles.map((profile) => (
    <InputProfileItem
      key={profile.id}
      profile={profile}
      active={profile.id === activeId}
      editing={editingId === profile.id}
      editValue={editValue}
      inputRef={inputRef}
      onSelect={onSelect}
      onDelete={onDelete}
      onStartEditing={startEditing}
      onCommitEdit={commitEdit}
      onCancelEdit={cancelEdit}
      onEditValueChange={setEditValue}
    />
  ));
};

export { InputProfileList };
