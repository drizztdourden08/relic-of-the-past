/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { Icon, Pressable, Status, TextInput, Text } from '@drizztdourden08/tessera/primitives';
import type { InputProfileItemProps } from './controls.type';

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

const InputProfileItem = (props: InputProfileItemProps) => {
  const {
    profile, active, editing, editValue, inputRef,
    onSelect, onDelete, onStartEditing, onCommitEdit, onCancelEdit, onEditValueChange,
  } = props;

  const handleSelect = useCallback(() => onSelect(profile), [onSelect, profile]);
  const handleStartEditing = useCallback(() => onStartEditing(profile), [onStartEditing, profile]);
  const handleCommit = useCallback(() => onCommitEdit(profile), [onCommitEdit, profile]);
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => onEditValueChange(e.target.value), [onEditValueChange]);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') onCommitEdit(profile);
    if (e.key === 'Escape') { e.preventDefault(); onCancelEdit(); }
  }, [onCommitEdit, onCancelEdit, profile]);
  const handleEditClick = useCallback((e: MouseEvent) => { e.stopPropagation(); onStartEditing(profile); }, [onStartEditing, profile]);
  const handleDeleteClick = useCallback((e: MouseEvent) => { e.stopPropagation(); onDelete(profile); }, [onDelete, profile]);

  return (
    <Pressable
      className={`input-profile-list__item ${active ? 'input-profile-list__item--active' : ''}`}
      onClick={handleSelect}
      onDoubleClick={handleStartEditing}
    >
      <Icon className="input-profile-list__item-icon" name={profile.deviceType === 'keyboard' ? 'keyboard' : 'gamepad-2'} />
      {editing ? (
        <TextInput
          ref={inputRef}
          className="input-profile-list__item-input"
          value={editValue}
          onChange={handleChange}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          onClick={stopPropagation}
        />
      ) : (
        <Text className="input-profile-list__item-name">{profile.name}</Text>
      )}
      {active && !editing && (
        <Status tone="primary" variant="pill" title="Active, drives the game">Active</Status>
      )}
      {!editing && (
        <Text
          className="input-profile-list__item-edit"
          title="Rename profile"
          onClick={handleEditClick}
        >
          <Icon name="pencil" />
        </Text>
      )}
      {!profile.isDefault && !editing && (
        <Text
          className="input-profile-list__item-delete"
          title="Delete profile"
          onClick={handleDeleteClick}
        >
          <Icon name="x" />
        </Text>
      )}
    </Pressable>
  );
};

export { InputProfileItem };
