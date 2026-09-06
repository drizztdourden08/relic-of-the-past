/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Button } from '@ds/primitives/Button';
import { Badge } from '@ds/primitives/Badge';
import { TextInput } from '@ds/primitives/TextInput';
import type { SheetMeta } from '@shared/game/data/player-sheet/types';

interface StudioToolbarProps {
  meta: SheetMeta;
  file: string | null;
  dirty: boolean;
  /**
   * The result of the last live push: null = not attempted, true = the running game took
   * it, false = the core refused. Reporting what actually happened beats predicting it, because
   * the gate depends on the running profile's own settings, not on this view's state.
   */
  applied: boolean | null;
  busy: boolean;
  onMeta: (meta: SheetMeta) => void;
  onSave: () => void;
  onSaveAs: (container: 'zspr' | 'rsp') => void;
  onExport: (container: 'zspr' | 'rsp') => void;
  onRevert: () => void;
  onClose: () => void;
}

const StudioToolbar = (props: StudioToolbarProps) => {
  const { meta, file, dirty, applied, busy, onMeta, onSave, onSaveAs, onExport, onRevert, onClose } = props;

  return (
    <Box className="studio-toolbar">
      <Box className="studio-toolbar__row">
        <TextInput
          className="studio-toolbar__name"
          value={meta.name}
          placeholder="Sprite name"
          onChange={(e) => onMeta({ ...meta, name: e.target.value })}
        />
        <TextInput
          className="studio-toolbar__author"
          value={meta.author}
          placeholder="Author"
          onChange={(e) => onMeta({ ...meta, author: e.target.value, authorShort: e.target.value })}
        />
        {file ? <Badge variant="neutral">{file}</Badge> : <Badge variant="warning">unsaved</Badge>}
        {dirty && <Badge variant="warning">edited</Badge>}
      </Box>

      <Box className="studio-toolbar__row">
        <Button variant="primary" size="sm" disabled={busy || (!dirty && !!file)} onClick={onSave}>Save</Button>
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => onSaveAs('rsp')}>Save as pack</Button>
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => onSaveAs('zspr')}>Save as .zspr</Button>
        <Button variant="tertiary" size="sm" disabled={busy} onClick={() => onExport('rsp')}>Export .rsp</Button>
        <Button variant="tertiary" size="sm" disabled={busy} onClick={() => onExport('zspr')}>Export .zspr</Button>
        <Button variant="ghost" size="sm" disabled={busy || !dirty} onClick={onRevert}>Revert</Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onClose}>Close</Button>
      </Box>

      <Box className="studio-toolbar__row">
        {applied === true && <Badge variant="success">applied to the running game</Badge>}
        {applied === false && <Badge variant="warning">saved, applies on next boot</Badge>}
        {applied === null && <Badge variant="neutral">not saved yet</Badge>}
        <Text className="studio-toolbar__hint">
          {applied === false
            ? 'The running game did not take it: a live apply needs the active profile to have this sprite selected, with Vanilla Safe off.'
            : 'Saving also pushes the sheet at a running game when the active profile has it selected.'}
        </Text>
      </Box>
    </Box>
  );
};

export { StudioToolbar };
export type { StudioToolbarProps };
