/* @layer renderer-components @kind component */
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import { primaryModifierLabel } from '@shared/platform';
import { usePlatform } from '@app/platform';
import { ARROW, stepOptions } from '../behavior/step-intent';
import type { MenuEntry } from '@ds/composites/DropdownMenu';
import type { OutlineRowMenuProps } from './OutlineRowMenu.type';

const OutlineRowMenu = (props: OutlineRowMenuProps) => {
  const { doc, id, anchorRef, removable, onStep, onRemove, onClose } = props;
  const key = primaryModifierLabel(usePlatform().info.os);

  const items: MenuEntry[] = stepOptions(doc, id).map((option) => ({
    key: option.direction,
    icon: ARROW[option.direction],
    label: option.label,
    shortcut: `${key} ${ARROW[option.direction]}`,
    disabled: !option.enabled,
    onClick: () => { onStep(option.direction); onClose(); },
  }));
  if (removable) {
    items.push('separator', {
      key: 'remove', icon: '✕', label: 'Delete', onClick: () => { onRemove(); onClose(); },
    });
  }

  return <DropdownMenu items={items} anchorRef={anchorRef} onClose={onClose} />;
};

export { OutlineRowMenu };
export type { OutlineRowMenuProps } from './OutlineRowMenu.type';
