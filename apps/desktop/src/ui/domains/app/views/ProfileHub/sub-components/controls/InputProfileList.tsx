/* @layer renderer-components @kind component */
import { useCallback, useState, useRef, useEffect } from 'react';
import type { InputProfile } from '@shared/types/controls/devices/devices.type';
import { Button, Box, Text } from '@drizztdourden08/tessera/primitives';
import { InputProfileItem } from './InputProfileItem';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const consumedInitialRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const startEditing = useCallback((profile: InputProfile) => {
    setEditingId(profile.id);
    setEditValue(profile.name);
  }, []);

  useEffect(() => {
    if (initialEditId && initialEditId !== consumedInitialRef.current) {
      consumedInitialRef.current = initialEditId;
      const profile = profiles.find(p => p.id === initialEditId);
      if (profile) startEditing(profile);
    }
  }, [initialEditId, profiles]);

  const commitEdit = useCallback((profile: InputProfile) => {
    if (editValue.trim()) {
      onRename(profile, editValue);
    }
    setEditingId(null);
  }, [editValue, onRename]);

  const cancelEdit = useCallback(() => setEditingId(null), []);

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
