/* @layer renderer-widgets @kind component */
/**
 * One HUD number, editable in place: the game's own digits, a field over them on click, a
 * wheel tick for one step (the next rung, on a ladder), and the step box on right click.
 * Without a writer it is the plain digits, for a ceiling the console does not set; with a
 * `lockedReason` it is the plain digits too, dimmed, with the reason as its tooltip.
 */
import { Box, Button, TextInput } from '@ds/primitives';
import { HudNumber } from '@domains/hud';
import { useNumberEdit } from '../behavior/useNumberEdit';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { NumberSetter } from '../../../sub-components/NumberSetter';
import { NUMBER_HINTS } from '../PlayerTab.constants';

const SNES_TILE = 8;

type NumberCellProps = {
  label: string;
  value: number;
  min?: number;
  max: number;
  digits: number;
  isMax?: boolean;
  /** Absent: the number is read-only. */
  write?: (next: number) => void;
  steps?: readonly number[];
  /** The only values allowed, in order; the wheel and the step box walk it. */
  ladder?: readonly number[];
  /** Set while the game cannot take this write; the number draws dimmed and does nothing. */
  lockedReason?: string;
  scale: number;
  spritesBase: string;
};

const NumberCell = (props: NumberCellProps) => {
  const { label, value, min = 0, max, digits, isMax = false, write, steps, ladder, lockedReason, scale, spritesBase } = props;
  const edit = useNumberEdit({ value, min, max, write: write ?? (() => undefined), ladder });
  const hint = usePointerHintTarget(label, NUMBER_HINTS);
  const tile = SNES_TILE * scale;

  const number = <HudNumber value={value} digits={digits} isMax={isMax} scale={scale} spritesBase={spritesBase} />;
  if (!write || lockedReason) {
    const title = lockedReason ? `${label}: ${lockedReason}` : `${label}: set by the seed`;
    return <Box className="cheats-player__number cheats-player__number--fixed" title={title}>{number}</Box>;
  }

  return (
    <Box ref={edit.hostRef} className="cheats-player__number" {...hint}>
      {number}
      {edit.isEditing ? (
        <TextInput
          ref={edit.inputRef}
          className="cheats-player__number-input"
          style={{ height: tile }}
          value={edit.draft ?? ''}
          inputMode="numeric"
          aria-label={`${label}, ${min} to ${max}`}
          onChange={(e) => edit.setDraft(e.target.value)}
          onKeyDown={edit.onKeyDown}
          onBlur={edit.commit}
        />
      ) : (
        <Button
          variant="bare"
          className="cheats-player__number-hit"
          aria-label={`Edit ${label}`}
          onClick={edit.begin}
          onContextMenu={edit.openSetter}
        />
      )}
      {edit.setterAnchor && (
        <NumberSetter
          title={label}
          value={value}
          min={min}
          max={max}
          steps={ladder ? undefined : steps}
          ladder={ladder}
          anchor={edit.setterAnchor}
          onCommit={write}
          onClose={edit.closeSetter}
        />
      )}
    </Box>
  );
};

export { NumberCell };
export type { NumberCellProps };
