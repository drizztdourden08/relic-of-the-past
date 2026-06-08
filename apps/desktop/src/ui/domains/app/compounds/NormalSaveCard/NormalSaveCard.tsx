/* @layer renderer-components @kind component */
import { useState, useRef } from 'react';
import { TextInput } from '../../../../design-system/primitives/TextInput';
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

  return (
    <div className={`normal-save-card ${busy ? 'normal-save-card--busy' : ''}`}>
      <div className="normal-save-card__thumb">
        {screenshotUrl ? (
          <img src={screenshotUrl} alt={name} className="normal-save-card__img" />
        ) : (
          <div className="normal-save-card__empty-thumb" />
        )}
      </div>
      <div className="normal-save-card__info">
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
          <span className="normal-save-card__name" onDoubleClick={handleStartRename}>
            {name}
          </span>
        )}
        <span className="normal-save-card__time">
          {new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>
      <div className="normal-save-card__actions">
        <button
          className="normal-save-card__btn normal-save-card__btn--load"
          onClick={() => onLoad(id)}
          disabled={busy}
          title="Load save"
        >
          Load
        </button>
        <button
          className="normal-save-card__btn normal-save-card__btn--overwrite"
          onClick={() => onOverwrite(id)}
          disabled={busy || !isGameRunning}
          title="Overwrite with current state"
        >
          Overwrite
        </button>
        <button
          className="normal-save-card__btn normal-save-card__btn--delete"
          onClick={() => onDelete(id)}
          disabled={busy}
          title="Delete save"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export { NormalSaveCard };
