/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { SlotPickActionsProps } from './SlotPickActions.type';

const SlotPickActions = (props: SlotPickActionsProps) => {
  const { index, disabled = false, onPickNumber, onPickItem, onPickGlyph } = props;
  const itemLabel = index === undefined ? 'Item placeholder' : `Item placeholder for slot ${index}`;
  const glyphLabel = index === undefined ? 'Glyph of this slot' : `Glyph of slot ${index}`;

  if (onPickNumber) {
    return (
      <IconButton variant="ghost" size="sm" label="Use this slot number" title="Use this number" disabled={disabled} onClick={onPickNumber}>
        <Icon name="check" size={14} />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton variant="ghost" size="sm" label={itemLabel} title="Item placeholder" disabled={disabled} onClick={onPickItem}>
        <Icon name="square" size={14} />
      </IconButton>
      <IconButton variant="ghost" size="sm" label={glyphLabel} title="Glyph of this slot" disabled={disabled} onClick={onPickGlyph}>
        <Icon name="circle-dot" size={14} />
      </IconButton>
    </>
  );
};

export { SlotPickActions };
export type { SlotPickActionsProps } from './SlotPickActions.type';
