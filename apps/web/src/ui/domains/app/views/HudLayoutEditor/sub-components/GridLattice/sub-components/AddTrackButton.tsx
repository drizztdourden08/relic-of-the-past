/* @layer renderer-components @kind component */
import plusIcon from '@iconify-icons/lucide/plus';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Button } from '@drizztdourden08/tessera/primitives';
import { WORD } from './AddTrackButton.constants';
import type { AddTrackButtonProps } from './AddTrackButton.type';

const AddTrackButton = (props: AddTrackButtonProps) => {
  const { axis, at, onAdd } = props;
  const label = `Add a ${WORD[axis]} at the end`;
  return (
    <Button
      variant="bare"
      className={`hud-lattice__add hud-lattice__add--${axis}`}
      aria-label={label}
      title={label}
      data-action={axis === 'columns' ? 'add-column' : 'add-row'}
      style={axis === 'columns' ? { gridColumn: at, gridRow: 1 } : { gridColumn: 1, gridRow: at }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onAdd}
    >
      <IconifyIcon icon={plusIcon} width={14} height={14} aria-hidden />
    </Button>
  );
};

export { AddTrackButton };
export type { AddTrackButtonProps } from './AddTrackButton.type';
