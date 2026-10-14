/* @layer renderer-components @kind component */
import { Box, Button, Status, TextInput } from '@drizztdourden08/tessera/primitives';
import type { StudioToolbarProps } from '../PlayerSpriteStudio.type';
import { ApplyRow } from './ApplyRow';

const StudioToolbar = (props: StudioToolbarProps) => {
  const { meta, file, dirty, applied, busy, readOnly, onMeta, onSave, onSaveAs, onExport, onRevert, onClose } = props;
  const locked = busy || readOnly;

  return (
    <Box className="studio-toolbar">
      <Box className="studio-toolbar__row">
        <TextInput
          className="studio-toolbar__name"
          value={meta.name}
          placeholder="Sprite name"
          disabled={readOnly}
          onChange={(e) => onMeta({ ...meta, name: e.target.value })}
        />
        <TextInput
          className="studio-toolbar__author"
          value={meta.author}
          placeholder="Author"
          disabled={readOnly}
          onChange={(e) => onMeta({ ...meta, author: e.target.value, authorShort: e.target.value })}
        />
        {file ? <Status tone="neutral">{file}</Status> : <Status tone="warning">unsaved</Status>}
        {dirty && <Status tone="warning">edited</Status>}
      </Box>

      <Box className="studio-toolbar__row">
        <Button variant="primary" size="sm" disabled={locked || (!dirty && Boolean(file))} onClick={onSave}>Save</Button>
        <Button variant="secondary" size="sm" disabled={locked} onClick={() => onSaveAs('rsp')}>Save as pack</Button>
        <Button variant="secondary" size="sm" disabled={locked} onClick={() => onSaveAs('zspr')}>Save as .zspr</Button>
        <Button variant="tertiary" size="sm" disabled={busy} onClick={() => onExport('rsp')}>Export .rsp</Button>
        <Button variant="tertiary" size="sm" disabled={busy} onClick={() => onExport('zspr')}>Export .zspr</Button>
        <Button variant="ghost" size="sm" disabled={locked || !dirty} onClick={onRevert}>Revert</Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onClose}>Close</Button>
      </Box>

      {!readOnly && <ApplyRow applied={applied} />}
    </Box>
  );
};

export { StudioToolbar };
export type { StudioToolbarProps };
