/* @layer renderer-components @kind component */
/**
 * BindingRow — a single input mapping row (SNES buttons, shortcuts, cheats).
 * Shows: action label | optional middle icon | optional middle label | binding icon | binding label
 * Entire row is clickable to initiate rebinding.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import type { InputBinding, ButtonIcon } from '@shared/types/controls';
import { getBindingLabel, getBindingIconUrl } from '@app/lib/input/binding-display';
import './BindingRow.css';

interface BindingRowProps {
  actionLabel: string;
  middleLabel?: string;
  middleIconUrl?: string | null;
  binding: InputBinding;
  bindingIcon?: ButtonIcon | null;
  /** Which controller this binding came from, shown only when the profile
   *  mixes more than one — a lone controller needs no such disambiguation. */
  deviceIconUrl?: string | null;
  onRebind: () => void;
  onClear?: () => void;
}

const BindingRow = (props: BindingRowProps) => {
  const { actionLabel, middleLabel, middleIconUrl, binding, bindingIcon, deviceIconUrl, onRebind, onClear } = props;
  const bindingLabel = getBindingLabel(binding, bindingIcon);
  const bindingIconSrc = getBindingIconUrl(binding, bindingIcon);
  const isNone = binding.type === 'none';

  return (
    <Box
      className="binding-row"
      role="button"
      tabIndex={0}
      title={`Click to rebind ${actionLabel}`}
      onClick={onRebind}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRebind(); } }}
    >
      {/* Action name */}
      <Text className="binding-row__action-label">{actionLabel}</Text>

      {/* Middle icon (e.g. SNES button icon) */}
      <Box className="binding-row__icon-slot">
        {middleIconUrl ? (
          <Image src={middleIconUrl} alt={middleLabel ?? ''} className="binding-row__icon-img" />
        ) : null}
      </Box>

      {/* Middle label (e.g. SNES button name) */}
      <Text className="binding-row__snes-label">{middleLabel ?? ''}</Text>

      {/* Bound input icon */}
      <Box className="binding-row__icon-slot">
        {bindingIconSrc ? (
          <Image src={bindingIconSrc} alt={bindingLabel} className="binding-row__icon-img" />
        ) : null}
      </Box>

      {/* Source controller, only shown when the profile mixes more than one */}
      {deviceIconUrl && (
        <Box className="binding-row__device-icon-slot">
          <Image src={deviceIconUrl} alt="" className="binding-row__device-icon-img" />
        </Box>
      )}

      {/* Bound input label */}
      <Text className={`binding-row__binding-label ${isNone ? 'binding-row__binding-label--none' : ''}`}>{bindingLabel}</Text>

      {/* Clear button */}
      {onClear && !isNone && (
        <Button
          variant="bare"
          className="binding-row__clear"
          title="Clear binding"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
        >
          ✕
        </Button>
      )}
    </Box>
  );
}

export { BindingRow };
