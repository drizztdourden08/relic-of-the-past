/* @layer renderer-components @kind component */
import {
  Box, Button, ButtonRow, Icon, IconButton, Image, Text, TextInput, Tooltip,
} from '@drizztdourden08/tessera/primitives';
import { DATE_FORMAT, NAME_MAX_LENGTH } from './SaveListRow.constants';
import { useRename } from './behavior/useRename';
import type { SaveListRowProps } from './SaveListRow.type';
import './SaveListRow.css';

const SaveListRow = (props: SaveListRowProps) => {
  const { id, name, timestamp, screenshotUrl, busy, isGameRunning, onLoad, onOverwrite, onDelete, onRename } = props;
  const rename = useRename(name, (next) => onRename(id, next));
  const saved = new Date(timestamp);

  const title = rename.editing ? (
    <TextInput
      ref={rename.inputRef}
      value={rename.value}
      onChange={(e) => rename.setValue(e.target.value)}
      onBlur={rename.commit}
      onKeyDown={rename.handleKeyDown}
      maxLength={NAME_MAX_LENGTH}
    />
  ) : (
    <Tooltip content={name} className="save-list-row__name-tip">
      <Text className="save-list-row__name" onDoubleClick={rename.start}>{name}</Text>
    </Tooltip>
  );

  return (
    <Box className={busy ? 'save-list-row save-list-row--busy' : 'save-list-row'} role="listitem">
      <Image frame src={screenshotUrl ?? undefined} alt={name} className="save-list-row__thumb" />
      <Box className="save-list-row__info">
        {title}
        <Text variant="caption" tone="dim">{saved.toLocaleString(undefined, DATE_FORMAT)}</Text>
      </Box>
      <ButtonRow className="save-list-row__actions" gap="sm">
        <Button variant="primary" size="sm" icon={<Icon name="play" />} onClick={() => onLoad(id)} disabled={busy}>
          Load
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Icon name="save" />}
          onClick={() => onOverwrite(id)}
          disabled={busy || !isGameRunning}
          title={isGameRunning ? 'Replace this save with the current game' : 'Start the game to overwrite'}
        >
          Overwrite
        </Button>
        <Tooltip content="Delete save">
          <IconButton variant="danger" size="sm" label="Delete save" onClick={() => onDelete(id)} disabled={busy}>
            <Icon name="trash-2" />
          </IconButton>
        </Tooltip>
      </ButtonRow>
    </Box>
  );
};

export { SaveListRow };
