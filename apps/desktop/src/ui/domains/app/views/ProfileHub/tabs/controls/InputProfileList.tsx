/* @layer renderer-components @kind component */
/**
 * InputProfileList — left column showing saved input profiles.
 * Active profile is highlighted. Supports create/delete/select/rename.
 */

import { useState, useRef, useEffect } from 'react';
import type { InputProfile } from '@shared/types/controls';
import { Button } from '../../../../../../design-system/primitives/Button';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
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
    <div className="input-profile-list">
      <div className="input-profile-list__header">
        <span className="input-profile-list__title">Input Profiles</span>
      </div>

      <div className="input-profile-list__items">
        {profiles.length === 0 && (
          <p className="input-profile-list__empty">No profiles yet</p>
        )}
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className={`input-profile-list__item ${profile.id === activeId ? 'input-profile-list__item--active' : ''}`}
            onClick={() => onSelect(profile)}
            onDoubleClick={() => startEditing(profile)}
          >
            <span className="input-profile-list__item-icon">
              {profile.deviceType === 'keyboard' ? '⌨️' : '🎮'}
            </span>
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
              <span className="input-profile-list__item-name">{profile.name}</span>
            )}
            {editingId !== profile.id && (
              <span
                className="input-profile-list__item-edit"
                title="Rename profile"
                onClick={(e) => { e.stopPropagation(); startEditing(profile); }}
              >
                ✏️
              </span>
            )}
            {!profile.isDefault && editingId !== profile.id && (
              <span
                className="input-profile-list__item-delete"
                title="Delete profile"
                onClick={(e) => { e.stopPropagation(); onDelete(profile); }}
              >
                ✕
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="input-profile-list__footer">
        <Button variant="secondary" size="sm" onClick={onCreate}>
          + New Profile
        </Button>
      </div>
    </div>
  );
}

export { InputProfileList };
