/* @layer renderer-components @kind component */
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import { STEP_ICON, STEP_KEY, stepOptions } from '@app/hud-layout-editing/step-intent';
import type { MenuNode } from '@drizztdourden08/tessera/composites';
import type { OutlineRowMenuProps } from './OutlineRowMenu.type';
import { useT } from '@drizztdourden08/brock-react';

const OutlineRowMenu = (props: OutlineRowMenuProps) => {
  const t = useT();
  const { doc, id, anchorRef, removable, onStep, onRemove, onClose } = props;

  const items: MenuNode[] = stepOptions(doc, id, t).map((option) => ({
    id: option.direction,
    icon: STEP_ICON[option.direction],
    label: option.label,
    shortcut: `mod+${STEP_KEY[option.direction]}`,
    disabled: !option.enabled,
    onSelect: () => onStep(option.direction),
  }));
  if (removable) {
    items.push({ separator: true }, { id: 'remove', icon: 'x', label: t('hud-editor:outline-row-menu.delete'), tone: 'danger', onSelect: onRemove });
  }

  return <DropdownMenu groups={[{ id: 'outline-row', items }]} label={t('hud-editor:outline-row-menu.label.outline-row')} anchorRef={anchorRef} onClose={onClose} />;
};

export { OutlineRowMenu };
