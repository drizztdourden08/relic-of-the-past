/* @layer renderer-hooks @kind logic */
import type { SpriteStatusLine, SpriteStatusProps } from '../PlayerSpriteStudio.type';

const spriteStatusOf = (props: SpriteStatusProps): SpriteStatusLine | null => {
  const { isNew, dirty, applied, readOnly, exportStatus, error } = props;
  if (error) return { tone: 'danger', text: error };
  if (readOnly) return { tone: 'neutral', text: 'Read only' };
  if (isNew) return { tone: 'warning', text: 'Not saved yet' };
  if (dirty) return { tone: 'warning', text: 'Unsaved changes' };
  if (exportStatus) return { tone: 'info', text: exportStatus };
  if (applied === true) return { tone: 'success', text: 'Applied to the running game' };
  if (applied === false) return { tone: 'info', text: 'Saved, applies on next boot' };
  return null;
};

export { spriteStatusOf };
