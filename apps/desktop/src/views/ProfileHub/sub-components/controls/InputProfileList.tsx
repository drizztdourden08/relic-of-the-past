/* @layer renderer-components @kind component */
import { Button, Box, Text } from '@drizztdourden08/tessera/primitives';
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
    onCreate,
  } = props;
  const { editingId, editValue, inputRef, setEditValue, startEditing, commitEdit, cancelEdit } =
    useProfileEditing({ profiles, initialEditId, onRename });

  return (
    <Box className="input-profile-list">
      <Box className="input-profile-list__header">
        <Text className="input-profile-list__title">Input Profiles</Text>
      </Box>

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

      <Box className="input-profile-list__footer">
        <Button variant="tertiary" size="sm" onClick={onCreate}>
          + New Profile
        </Button>
      </Box>
    </Box>
  );
};

export { InputProfileList };
