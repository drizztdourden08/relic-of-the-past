/* @layer renderer-components @kind component */
import wrapIcon from '@iconify-icons/lucide/wrap-text';
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { DirectionControl } from './DirectionControl';
import { SubSection } from './SubSection';
import { WRAP_LABEL } from './FlowSettings.constants';
import type { FlowSettingsProps } from './FlowSettings.type';
import { useT } from '@drizztdourden08/brock-react';

const FlowSettings = (props: FlowSettingsProps) => {
  const t = useT();
  const { direction, onDirection, wrap, onWrap } = props;
  return (
    <SubSection title={t('hud-editor:flow-settings.title.flow')}>
      <Box className="hud-engine-row">
        <Box className="hud-layout-set__piece">
          <Text className="hud-layout-set__label">{t('hud-editor:flow-settings.text.direction')}</Text>
          <DirectionControl variant="bare" value={direction} onChange={onDirection} />
        </Box>
        <Box className="hud-layout-set__piece">
          <Text className="hud-layout-set__label">{t('hud-editor:flow-settings.text.wrap')}</Text>
          <IconButton
            variant="ghost"
            size="sm"
            title={WRAP_LABEL}
            active={wrap}
            label={WRAP_LABEL}
            data-action="wrap"
            onClick={() => onWrap(!wrap)}
          >
            <Icon icon={wrapIcon} size={16} aria-hidden />
          </IconButton>
        </Box>
      </Box>
    </SubSection>
  );
};

export { FlowSettings };
