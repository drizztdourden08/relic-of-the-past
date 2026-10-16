/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { InputProfileItem } from './InputProfileItem';
import { useProfileEditing } from './useProfileEditing';
import type { InputProfileListProps } from './controls.type';
import './InputProfileList.css';

const InputProfileList = (props: InputProfileListProps) => {
  const {
    profiles,
    activeId,
    initialEditId,
    onSelect,
    onDelete,
    onRename,
  } = props;
  const { editingId, editValue, inputRef, setEditValue, startEditing, commitEdit, cancelEdit } =
    useProfileEditing({ profiles, initialEditId, onRename });

  return (
    <Box className="input-profile-list">
      <Box className="input-profile-list__items">
        {profiles.length === 0 && (
          <Text as="p" className="input-profile-list__empty">No profiles yet</Text>
        )}
        {profiles.map((profile) => (
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
        ))}
      </Box>
    </Box>
  );
};

export { InputProfileList };
