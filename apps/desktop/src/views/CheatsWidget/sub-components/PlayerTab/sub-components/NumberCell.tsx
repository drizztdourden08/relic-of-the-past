/* @layer renderer-widgets @kind component */
import { Box, Pressable, TextInput } from '@drizztdourden08/tessera/primitives';
import { HudNumber } from '@app/hud';
import { useNumberEdit } from '../behavior/useNumberEdit';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { NumberSetter } from '../../NumberSetter';
import { NUMBER_HINTS, SNES_TILE } from '../PlayerTab.constants';
import type { NumberCellProps } from '../PlayerTab.type';

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
        <Pressable
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
