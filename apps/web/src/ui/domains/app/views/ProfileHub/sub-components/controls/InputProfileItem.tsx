/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { Button } from '../../../../../../design-system/primitives/Button';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
import { Text } from '../../../../../../design-system/primitives/Text';
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
    <Button
      variant="bare"
      className={`input-profile-list__item ${active ? 'input-profile-list__item--active' : ''}`}
      onClick={handleSelect}
      onDoubleClick={handleStartEditing}
    >
      <Text className="input-profile-list__item-icon">
        {profile.deviceType === 'keyboard' ? '⌨️' : '🎮'}
      </Text>
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
        <Text className="input-profile-list__item-badge" title="Active, drives the game">Active</Text>
      )}
      {!editing && (
        <Text
          className="input-profile-list__item-edit"
          title="Rename profile"
          onClick={handleEditClick}
        >
          ✏️
        </Text>
      )}
      {!profile.isDefault && !editing && (
        <Text
          className="input-profile-list__item-delete"
          title="Delete profile"
          onClick={handleDeleteClick}
        >
          ✕
        </Text>
      )}
    </Button>
  );
};

export { InputProfileItem };
