/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { Icon, IconButton, TextInput } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { profileSubtitle } from './profile-subtitle';
import type { InputProfileItemProps } from './controls.type';

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
  const icon = <Icon name={profile.deviceType === 'keyboard' ? 'keyboard' : 'gamepad-2'} />;

  if (editing) {
    const field = (
      <TextInput ref={inputRef} value={editValue} onChange={handleChange} onBlur={handleCommit} onKeyDown={handleKeyDown} aria-label="Profile name" />
    );
    return <ListItemRow icon={icon} name={field} selected={active} />;
  }

  const actions = (
    <>
      <IconButton variant="ghost" size="xs" label="Rename profile" onClick={handleEditClick}>
        <Icon name="pencil" />
      </IconButton>
      {!profile.isDefault && (
        <IconButton variant="ghost" size="xs" label="Delete profile" onClick={handleDeleteClick}>
          <Icon name="x" />
        </IconButton>
      )}
    </>
  );

  return (
    <ListItemRow
      icon={icon}
      name={profile.name}
      meta={profileSubtitle(profile)}
      selected={active}
      onClick={handleSelect}
      onDoubleClick={handleStartEditing}
      action={actions}
      actionVisibility="hover"
      data={{ 'data-profile-id': profile.id }}
    />
  );
};

export { InputProfileItem };
