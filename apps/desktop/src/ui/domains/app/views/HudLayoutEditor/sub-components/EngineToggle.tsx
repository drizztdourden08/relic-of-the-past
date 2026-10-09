/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { ENGINES } from './EngineToggle.constants';
import './HudLayoutEditor.layout.css';
import './HudLayoutEditor.layout-set.css';
import type { EngineToggleProps } from './EngineToggle.type';

const EngineToggle = (props: EngineToggleProps) => {
  const { value, onChange } = props;
  return (
    <Box className="hud-icon-choice" role="group" aria-label="engine">
      {ENGINES.map((engine) => (
        <IconButton
          key={engine.value}
          variant="ghost"
          size="sm"
          title={engine.label}
          active={value === engine.value}
          label={engine.label}
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
export type { EngineToggleProps, LayoutEngine } from './EngineToggle.type';
