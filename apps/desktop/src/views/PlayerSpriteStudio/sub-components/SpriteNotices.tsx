/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { NOT_APPLIED_NOTE } from '../PlayerSpriteStudio.constants';
import type { SpriteNoticesProps } from '../PlayerSpriteStudio.type';

const SpriteNotices = (props: SpriteNoticesProps) => {
  const { applied, readOnly, exportStatus, error } = props;

  return (
    <>
      {!readOnly && applied === false && <Text variant="caption" tone="muted">{NOT_APPLIED_NOTE}</Text>}
      {exportStatus && <Text variant="caption" tone="info">{exportStatus}</Text>}
      {error && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
    </>
  );
};

export { SpriteNotices };
