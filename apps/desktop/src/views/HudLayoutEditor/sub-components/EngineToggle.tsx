/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { ENGINES } from './EngineToggle.constants';
import type { EngineToggleProps } from './EngineToggle.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const EngineToggle = (props: EngineToggleProps) => {
  const t = useT();
  const text = useText();
  const { value, onChange } = props;
  return (
    <Box className="hud-icon-choice" role="group" aria-label={t('hud-editor:engine-toggle.aria.engine')}>
      {ENGINES.map((engine) => (
        <IconButton
          key={engine.value}
          variant="ghost"
          size="sm"
          title={text(engine.label)}
          active={value === engine.value}
          label={text(engine.label)}
          data-engine={engine.value}
          onClick={() => onChange(engine.value)}
        >
          <Icon icon={engine.icon} size={16} aria-hidden />
        </IconButton>
      ))}
    </Box>
  );
};

export { EngineToggle };
