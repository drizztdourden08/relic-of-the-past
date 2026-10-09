/* @layer renderer-widgets @kind component */
import { Box, Button, Image } from '@drizztdourden08/tessera/primitives';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import type { ControlHint } from '../../../sub-components/ControlGlyph.type';
import { GIVE_HINT, TIERS_HINT, TOGGLE_HINT } from '../ItemsTab.constants';
import type { SlotCellProps } from '../ItemsTab.type';

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
