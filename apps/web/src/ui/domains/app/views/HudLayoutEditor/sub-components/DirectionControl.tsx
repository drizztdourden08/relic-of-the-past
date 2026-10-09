/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { IconButton } from '@ds/primitives/IconButton';
import { DIRECTIONS } from './DirectionControl.constants';
import './HudLayoutEditor.layout.css';
import './HudLayoutEditor.layout-set.css';
import type { DirectionControlProps } from './DirectionControl.type';

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

export { DirectionControl };
export type { DirectionControlProps } from './DirectionControl.type';
