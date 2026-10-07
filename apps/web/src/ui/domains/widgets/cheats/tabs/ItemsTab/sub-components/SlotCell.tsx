/* @layer renderer-widgets @kind component */
/**
 * One clickable pause slot. Draws its children (the game's own slot rendering) when owned, a
 * ghost of the first tier's sprite when not, and a gold corner mark when a click opens a list.
 * A right click opens the list on any slot, owned or not, so a tier can be picked outright.
 * The pointer hint beside the cursor names the slot and says what each button does here.
 * A remount (the caller changes its key) restarts the flash that follows a give.
 */
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Box, Button, Image } from '@ds/primitives';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import type { ControlHint } from '../../../sub-components/ControlGlyph.type';

const PICK_ROW: ControlHint = { glyph: 'mouse-right', label: 'pick a tier' };
const GIVE_HINT: readonly ControlHint[] = [{ glyph: 'mouse-left', label: 'give it' }, PICK_ROW];
const TIERS_HINT: readonly ControlHint[] = [{ glyph: 'mouse-left', label: 'open its tiers' }, PICK_ROW];
const TOGGLE_HINT: readonly ControlHint[] = [{ glyph: 'mouse-left', label: 'toggle it' }];

type SlotCellProps = {
  /** Width of the cell in CSS pixels, and its height unless `height` says otherwise. */
  size: number;
  /** A crystal is two tiles wide and one tall. */
  height?: number;
  owned: boolean;
  /** Whether a click opens a list; draws the corner mark. */
  menu: boolean;
  /** Full URL of the ghost sprite drawn while unowned. */
  ghost: string | null;
  title: string;
  flash?: boolean;
  style?: CSSProperties;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  /** A right click: opens the slot's list whatever it holds. Absent on a plain toggle. */
  onOpenList?: (e: MouseEvent<HTMLButtonElement>) => void;
  onHover: (active: boolean) => void;
  children?: ReactNode;
};

const hintFor = (owned: boolean, menu: boolean, hasList: boolean): readonly ControlHint[] => {
  if (!hasList) return TOGGLE_HINT;
  if (!owned) return GIVE_HINT;
  return menu ? TIERS_HINT : TOGGLE_HINT;
};

const SlotCell = (props: SlotCellProps) => {
  const { size, height = size, owned, menu, ghost, title, flash = false, style, onClick, onOpenList, onHover, children } = props;
  const hint = usePointerHintTarget(title, hintFor(owned, menu, onOpenList !== undefined));
  const className = [
    'cheats-items__cell',
    owned ? 'cheats-items__cell--owned' : 'cheats-items__cell--ghost',
    menu && 'cheats-items__cell--menu',
    flash && 'cheats-items__cell--flash',
  ].filter(Boolean).join(' ');

  return (
    <Button
      variant="bare"
      className={className}
      style={{ width: size, height, ...style }}
      onClick={onClick}
      onContextMenu={onOpenList ? (e) => { e.preventDefault(); onOpenList(e); } : undefined}
      onMouseEnter={(e) => { onHover(true); hint.onMouseEnter(e); }}
      onMouseMove={hint.onMouseMove}
      onMouseLeave={() => { onHover(false); hint.onMouseLeave(); }}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      {children}
      {!owned && ghost && (
        <Image
          className="cheats-items__ghost"
          src={ghost}
          alt=""
          draggable={false}
          width={size}
          height={height}
          fallback={<Box className="cheats-items__ghost cheats-items__ghost--missing" style={{ width: size, height }} />}
        />
      )}
    </Button>
  );
};

export { SlotCell };
export type { SlotCellProps };
