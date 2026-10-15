/* @layer renderer-components @kind component */
import { Icon, Pressable } from '@drizztdourden08/tessera/primitives';
import { WORD } from './AddTrackButton.constants';
import type { AddTrackButtonProps } from './AddTrackButton.type';

const AddTrackButton = (props: AddTrackButtonProps) => {
  const { axis, at, onAdd } = props;
  const label = `Add a ${WORD[axis]} at the end`;
  return (
    <Pressable
      className={`hud-lattice__add hud-lattice__add--${axis}`}
      aria-label={label}
      title={label}
      data-action={axis === 'columns' ? 'add-column' : 'add-row'}
      style={axis === 'columns' ? { gridColumn: at, gridRow: 1 } : { gridColumn: 1, gridRow: at }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onAdd}
    >
      <Icon name="plus" size={14} aria-hidden />
    </Pressable>
  );
};

export { AddTrackButton };
