/* @layer renderer-components @kind component */
import { Box, Field, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { DIRECTIONS } from './DirectionControl.constants';
import type { DirectionControlProps } from './DirectionControl.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const DirectionControl = (props: DirectionControlProps) => {
  const t = useT();
  const text = useText();
  const { value, onChange, disabled, variant = 'field' } = props;
  const body = (
    <Box className="hud-icon-choice" role="group" aria-label={t('hud-editor:direction-control.aria.direction')}>
      {DIRECTIONS.map((option) => (
        <IconButton
          key={option.value}
          variant="ghost"
          size="sm"
          title={text(option.label)}
          disabled={disabled}
          active={value === option.value}
          label={text(option.label)}
          onClick={() => onChange(option.value)}
        >
          <Icon icon={option.icon} size={16} aria-hidden />
        </IconButton>
      ))}
    </Box>
  );

  if (variant === 'bare') return body;
  return <Field size="sm" label={t('hud-editor:direction-control.label.direction')}>{body}</Field>;
};

export { DirectionControl };
