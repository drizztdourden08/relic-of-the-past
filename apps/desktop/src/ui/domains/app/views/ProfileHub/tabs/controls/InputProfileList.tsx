/* @layer renderer-components @kind component */
/**
 * InputProfileList — left column showing saved input profiles.
 * Active profile is highlighted. Supports create/delete/select/rename.
 */

import { useState, useRef, useEffect } from 'react';
import type { InputProfile } from '@shared/types/controls';
import { Button } from '../../../../../../design-system/primitives/Button';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import './InputProfileList.css';

interface InputProfileListProps {
  profiles: InputProfile[];
  activeId: string | null;
  initialEditId?: string | null;
  onSelect: (profile: InputProfile) => void;
  onDelete: (profile: InputProfile) => void;
  onRename: (profile: InputProfile, newName: string) => void;
  onCreate: () => void;
}

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

  // Auto-enter edit mode for newly created profiles
  useEffect(() => {
    if (initialEditId && initialEditId !== consumedInitialRef.current) {
      consumedInitialRef.current = initialEditId;
      const profile = profiles.find(p => p.id === initialEditId);
      if (profile) startEditing(profile);
    }
  }, [initialEditId, profiles]);

  const startEditing = (profile: InputProfile) => {
    setEditingId(profile.id);
    setEditValue(profile.name);
  };

  const commitEdit = (profile: InputProfile) => {
    if (editValue.trim()) {
      onRename(profile, editValue);
    }
    setEditingId(null);
  };

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
          <Box
            as="button"
            key={profile.id}
            className={`input-profile-list__item ${profile.id === activeId ? 'input-profile-list__item--active' : ''}`}
            onClick={() => onSelect(profile)}
            onDoubleClick={() => startEditing(profile)}
          >
            <Text className="input-profile-list__item-icon">
              {profile.deviceType === 'keyboard' ? '⌨️' : '🎮'}
            </Text>
            {editingId === profile.id ? (
              <TextInput
                ref={inputRef}
                className="input-profile-list__item-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(profile)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit(profile);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Text className="input-profile-list__item-name">{profile.name}</Text>
            )}
            {editingId !== profile.id && (
              <Text
                className="input-profile-list__item-edit"
                title="Rename profile"
                onClick={(e) => { e.stopPropagation(); startEditing(profile); }}
              >
                ✏️
              </Text>
            )}
            {!profile.isDefault && editingId !== profile.id && (
              <Text
                className="input-profile-list__item-delete"
                title="Delete profile"
                onClick={(e) => { e.stopPropagation(); onDelete(profile); }}
              >
                ✕
              </Text>
            )}
          </Box>
        ))}
      </Box>

      <Box className="input-profile-list__footer">
        <Button variant="secondary" size="sm" onClick={onCreate}>
          + New Profile
        </Button>
      </Box>
    </Box>
  );
}

export { InputProfileList };
