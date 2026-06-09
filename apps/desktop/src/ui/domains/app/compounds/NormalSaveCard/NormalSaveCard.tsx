/* @layer renderer-components @kind component */
import { useState, useRef } from 'react';
import { Thumbnail } from '../../../../design-system/primitives/Thumbnail';
import { Text } from '../../../../design-system/primitives/Text';
import { Button } from '../../../../design-system/primitives/Button';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { TextInput } from '../../../../design-system/primitives/TextInput';
import { SaveCard } from '../SaveCard';
import type { NormalSaveCardProps } from './NormalSaveCard.type';
import './NormalSaveCard.css';

const NormalSaveCard = (props: NormalSaveCardProps) => {
  const { id, name, timestamp, screenshotUrl, busy, isGameRunning, onLoad, onOverwrite, onDelete, onRename } = props;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = () => {
    setEditValue(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleCommitRename = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name) {
      onRename(id, trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCommitRename();
    if (e.key === 'Escape') setEditing(false);
  };

  const actions = (
    <>
      <Button variant="tertiary" size="sm" onClick={() => onLoad(id)} disabled={busy} title="Load save">
        Load
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        onClick={() => onOverwrite(id)}
        disabled={busy || !isGameRunning}
        title="Overwrite with current state"
      >
        Overwrite
      </Button>
      <IconButton variant="danger" label="Delete save" onClick={() => onDelete(id)} disabled={busy}>
        ✕
      </IconButton>
    </>
  );

  return (
    <SaveCard
      variant="row"
      busy={busy}
      thumb={<Thumbnail src={screenshotUrl} alt={name} className="normal-save-card__thumb" />}
      actions={actions}
    >
      {editing ? (
        <TextInput
          ref={inputRef}
          className="normal-save-card__name-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCommitRename}
          onKeyDown={handleKeyDown}
          maxLength={64}
        />
      ) : (
        <Text className="normal-save-card__name" onDoubleClick={handleStartRename}>
          {name}
        </Text>
      )}
      <Text className="normal-save-card__time">
        {new Date(timestamp).toLocaleString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })}
      </Text>
    </SaveCard>
  );
};

export { NormalSaveCard };
