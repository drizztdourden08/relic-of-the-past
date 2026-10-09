/* @layer renderer-components @kind component */
import { Image, Text, Button, IconButton, TextInput } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { useRename } from './behavior/useRename';
import type { NormalSaveCardProps } from './NormalSaveCard.type';
import './NormalSaveCard.css';

const formatTime = (timestamp: number): string => new Date(timestamp).toLocaleString(undefined, {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const NormalSaveCard = (props: NormalSaveCardProps) => {
  const { id, name, timestamp, screenshotUrl, busy, isGameRunning, onLoad, onOverwrite, onDelete, onRename } = props;
  const rename = useRename(name, (next) => onRename(id, next));

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

  const title = rename.editing ? (
    <TextInput
      ref={rename.inputRef}
      className="normal-save-card__name-input"
      value={rename.value}
      onChange={(e) => rename.setValue(e.target.value)}
      onBlur={rename.commit}
      onKeyDown={rename.handleKeyDown}
      maxLength={64}
    />
  ) : (
    <Text className="normal-save-card__name" onDoubleClick={rename.start}>{name}</Text>
  );

  return (
    <ListItemRow
      className={busy ? 'normal-save-card normal-save-card--busy' : 'normal-save-card'}
      icon={<Image frame src={screenshotUrl ?? undefined} alt={name} className="normal-save-card__thumb" />}
      name={title}
      meta={formatTime(timestamp)}
      action={actions}
    />
  );
};

export { NormalSaveCard };
