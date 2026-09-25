/* @layer renderer-components @kind component */
/**
 * Two arrows instead of a text `Select`: which way a flex container's children
 * flow.
 *
 * THERE WERE THREE. `stack` had the third icon while the flex engine carried
 * an overlay mode that was not a flow at all; §42 gave that back to the grid it
 * always was, so this control now asks exactly one question and has exactly two
 * answers. "Overlay" is a grid preset in the Container menu, one click away.
 *
 * THE ARROWS ARE LUCIDE NOW, AND THE "DIRECTION" LABEL IS GONE (§51). Two text
 * glyphs beside a toolbar of real icons is the fault §50 named on the other
 * toolbar; and an arrow IS the word "direction", so a label above it bought a
 * line of height for nothing. `bare` is what the flex bar mounts. The label
 * survives as each button's own accessible name and tooltip.
 */
import arrowDown from '@iconify-icons/lucide/arrow-down';
import arrowRight from '@iconify-icons/lucide/arrow-right';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { IconButton } from '@ds/primitives/IconButton';
import './HudLayoutEditor.layout.css';
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { FlowDirection } from '../behavior/align-options';

interface DirectionOption {
  value: FlowDirection;
  icon: IconifyIconData;
  /** The accessible name and the tooltip. A word plus what it does. */
  label: string;
}

const DIRECTIONS: readonly DirectionOption[] = [
  { value: 'row', icon: arrowRight, label: 'row. Children flow left to right' },
  { value: 'column', icon: arrowDown, label: 'column. Children flow top to bottom' },
];

interface DirectionControlProps {
  value: FlowDirection;
  onChange: (next: FlowDirection) => void;
  disabled?: boolean;
  /** Drops the `Field` and its "direction" label; the arrows are the label. */
  variant?: 'field' | 'bare';
}

const DirectionControl = (props: DirectionControlProps) => {
  const { value, onChange, disabled, variant = 'field' } = props;
  const body = (
    <Box className="hud-icon-choice" role="group" aria-label="direction">
      {DIRECTIONS.map((option) => (
        <IconButton
          key={option.value}
          variant="ghost"
          size="sm"
          title={option.label}
          disabled={disabled}
          active={value === option.value}
          label={option.label}
          onClick={() => onChange(option.value)}
        >
          <IconifyIcon icon={option.icon} width={16} height={16} aria-hidden />
        </IconButton>
      ))}
    </Box>
  );

  if (variant === 'bare') return body;
  return <Field size="sm" label="direction">{body}</Field>;
};

export { DIRECTIONS, DirectionControl };
export type { DirectionControlProps };
