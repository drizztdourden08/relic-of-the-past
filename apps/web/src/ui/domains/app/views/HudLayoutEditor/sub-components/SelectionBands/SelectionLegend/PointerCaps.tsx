/* @layer renderer-components @kind component */
import { Icon, Shortcut } from '@drizztdourden08/tessera/primitives';
import { capLabel } from '../behavior/cap-label';
import type { PointerCapsProps } from './PointerCaps.type';

const PointerCaps = (props: PointerCapsProps) => {
  const { shortcut, os } = props;
  const keys = (shortcut.keys ?? []).map((key) => capLabel(key, os));
  const drag = shortcut.mouse === 'drag';
  const mouse = shortcut.mouse === 'drag' ? 'left' : shortcut.mouse;

  return (
    <>
      {mouse === undefined
        ? <Shortcut size="xs" keys={keys} />
        : <Shortcut size="xs" keys={keys} mouse={mouse} />}
      {drag && <Icon name="move" size={14} className="hud-grid__drag" label="drag" />}
    </>
  );
};

export { PointerCaps };
export type { PointerCapsProps } from './PointerCaps.type';
