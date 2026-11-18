/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { SlotPickActionsProps } from './SlotPickActions.type';
import { useT } from '@drizztdourden08/brock-react';

const SlotPickActions = (props: SlotPickActionsProps) => {
  const t = useT();
  const { index, disabled = false, onPickNumber, onPickItem, onPickGlyph } = props;
  const itemLabel = index === undefined ? 'Item placeholder' : `Item placeholder for slot ${index}`;
  const glyphLabel = index === undefined ? 'Glyph of this slot' : `Glyph of slot ${index}`;

  if (onPickNumber) {
    return (
      <IconButton variant="ghost" size="sm" label={t('hud-editor:slot-pick-actions.label.use-this-slot-number')} title={t('hud-editor:slot-pick-actions.title.use-this-number')} disabled={disabled} onClick={onPickNumber}>
        <Icon name="check" size={14} />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton variant="ghost" size="sm" label={itemLabel} title={t('hud-editor:slot-pick-actions.title.item-placeholder')} disabled={disabled} onClick={onPickItem}>
        <Icon name="square" size={14} />
      </IconButton>
      <IconButton variant="ghost" size="sm" label={glyphLabel} title={t('hud-editor:slot-pick-actions.title.glyph-of-this-slot')} disabled={disabled} onClick={onPickGlyph}>
        <Icon name="circle-dot" size={14} />
      </IconButton>
    </>
  );
};

export { SlotPickActions };
