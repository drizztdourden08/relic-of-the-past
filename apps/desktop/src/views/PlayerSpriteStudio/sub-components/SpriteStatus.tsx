/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { spriteStatusOf } from '../behavior/sprite-status-of';
import type { SpriteStatusProps } from '../PlayerSpriteStudio.type';

const SpriteStatus = (props: SpriteStatusProps) => {
  const line = spriteStatusOf(props);
  if (!line) return null;

  return <Status tone={line.tone}>{line.text}</Status>;
};

export { SpriteStatus };
