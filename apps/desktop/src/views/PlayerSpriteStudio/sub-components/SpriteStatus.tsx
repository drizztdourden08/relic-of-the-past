/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import type { SpriteStatusProps } from '../PlayerSpriteStudio.type';

const SpriteStatus = (props: SpriteStatusProps) => {
  const { open, file, dirty, applied, readOnly } = props;
  if (!open) return null;

  return (
    <>
      {file ? <Status tone="neutral">{file}</Status> : <Status tone="warning">Not saved yet</Status>}
      {dirty && <Status tone="warning">Unsaved changes</Status>}
      {!readOnly && applied === true && <Status tone="success">Applied to the running game</Status>}
      {!readOnly && applied === false && <Status tone="info">Saved, applies on next boot</Status>}
    </>
  );
};

export { SpriteStatus };
