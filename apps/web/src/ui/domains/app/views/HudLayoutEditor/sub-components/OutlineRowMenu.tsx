/* @layer renderer-components @kind component */
/**
 * THE ROW'S CONTEXT MENU is the only place the four move operations are ever
 * spelled in words, and therefore the surface the shortcuts are learned from.
 *
 * A SHORTCUT NOBODY IS TOLD ABOUT IS A FEATURE NOBODY HAS. That is the same
 * argument the stage's hint strip makes for the drag's modifier, one surface
 * over: the keys exist and are conventional, but nothing in the editor says so
 * until this menu does. Every item prints its own key, formatted with
 * `primaryModifierLabel`, so the label can never disagree with the key that
 * works on this platform.
 *
 * A DIMMED ITEM THAT NAMES ITS OWN PRECONDITION TEACHES THE RULE; a missing item
 * teaches nothing. `Move into hearts` goes grey when the previous sibling is a
 * leaf and becomes `Move into...` when there is no previous sibling at all, and
 * both say more than the item's absence would.
 *
 * IT NEEDS NO KEY HANDLING OF ITS OWN. `DropdownMenu` registers on §33's dismiss
 * stack at `menu` the moment it is given an `onClose`, which puts it correctly
 * below a popover opened out of it and below a live drag, and above the editor
 * layer it sits in.
 *
 * IT OPENS FROM THE KEYBOARD TOO, which is the whole point of the phase: the
 * row handles the platform's two menu gestures (the `ContextMenu` key and
 * Shift+F10) beside the right-click, so a menu that exists to teach keyboard
 * users about keys is not itself pointer-only.
 */
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import { primaryModifierLabel } from '@shared/platform';
import { usePlatform } from '@app/platform';
import { ARROW, stepOptions } from '../behavior/step-intent';
import type { RefObject } from 'react';
import type { MenuEntry } from '@ds/composites/DropdownMenu';
import type { StepDirection } from '../behavior/step-intent';
import type { HudLayout } from '@shared/types/hud';

interface OutlineRowMenuProps {
  doc: HudLayout;
  /** The row this menu belongs to. */
  id: string;
  anchorRef: RefObject<HTMLElement | null>;
  /** Whether this row may be removed at all. A repeat's child and the screen
   *  may not, exactly as the row's own ✕ button already decides. */
  removable: boolean;
  onStep: (direction: StepDirection) => void;
  onRemove: () => void;
  onClose: () => void;
}

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
export type { OutlineRowMenuProps };
