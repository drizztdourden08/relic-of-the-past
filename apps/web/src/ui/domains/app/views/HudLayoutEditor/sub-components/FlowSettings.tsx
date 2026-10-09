/* @layer renderer-components @kind component */
import wrapIcon from '@iconify-icons/lucide/wrap-text';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { DirectionControl } from './DirectionControl';
import { SubSection } from './SubSection';
import { WRAP_LABEL } from './FlowSettings.constants';
import './HudLayoutEditor.layout.css';
import type { FlowSettingsProps } from './FlowSettings.type';

const FlowSettings = (props: FlowSettingsProps) => {
  const { direction, onDirection, wrap, onWrap } = props;
  return (
    <SubSection title="Flow">
      <Box className="hud-engine-row">
        <Box className="hud-layout-set__piece">
          <Text className="hud-layout-set__label">Direction</Text>
          <DirectionControl variant="bare" value={direction} onChange={onDirection} />
        </Box>
        <Box className="hud-layout-set__piece">
          <Text className="hud-layout-set__label">Wrap</Text>
          <IconButton
            variant="ghost"
            size="sm"
            title={WRAP_LABEL}
            active={wrap}
            label={WRAP_LABEL}
            data-action="wrap"
            onClick={() => onWrap(!wrap)}
          >
            <IconifyIcon icon={wrapIcon} width={16} height={16} aria-hidden />
          </IconButton>
        </Box>
      </Box>
    </SubSection>
  );
};

export { FlowSettings };
export type { FlowSettingsProps } from './FlowSettings.type';
