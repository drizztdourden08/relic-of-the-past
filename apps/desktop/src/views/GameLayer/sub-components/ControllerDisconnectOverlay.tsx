/* @layer renderer-components @kind component */
import { Trans, useT } from '@drizztdourden08/brock-react';
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { InputGlyph } from '../../../compounds/InputGlyph';
import { resolveFunctionMappingIcon } from '../../../game';
import type { FunctionMapping } from '@rotp/features';
import type { ControllerDisconnectOverlayProps } from './ControllerDisconnectOverlay.type';
import './ControllerDisconnectOverlay.css';

const glyph = (m: FunctionMapping) => (
  <InputGlyph binding={m.binding} icon={m.icon ?? resolveFunctionMappingIcon(m)} showLabel={false} />
);

const ControllerDisconnectOverlay = (props: ControllerDisconnectOverlayProps) => {
  const { controllerName, pauseMapping, prevMapping, nextMapping, canSwitchProfile, onResume } = props;
  const t = useT();
  const showResume = pauseMapping != null && pauseMapping.binding.type !== 'none';
  const showSwitch = canSwitchProfile && prevMapping != null && nextMapping != null;

  return (
    <Box className="controller-disconnect-overlay" onDoubleClick={onResume}>
      <Box className="controller-disconnect-overlay__card">
        <Box className="controller-disconnect-overlay__icon">
          <Icon name="gamepad-2" />
        </Box>
        <Text as="h2" className="controller-disconnect-overlay__title">{t('views-game-layer:controller.title')}</Text>
        <Text as="p" className="controller-disconnect-overlay__message">
          <Trans k="views-game-layer:controller.message" values={{ name: controllerName }} tags={{ strong: (chunks) => <Text as="strong">{chunks}</Text> }} />
        </Text>
        <Box className="controller-disconnect-overlay__actions">
          <Text as="p">{t('views-game-layer:controller.reconnect')}</Text>
          <Box className="controller-disconnect-overlay__option">
            <Text>{t('views-game-layer:controller.doubleClick')}</Text>
          </Box>
          {showResume && (
            <Box className="controller-disconnect-overlay__option">
              {glyph(pauseMapping)}
              <Text>{t('views-game-layer:controller.resume')}</Text>
            </Box>
          )}
          {showSwitch && (
            <Box className="controller-disconnect-overlay__option">
              {glyph(prevMapping)}{glyph(nextMapping)}
              <Text>{t('views-game-layer:controller.switchProfile')}</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export { ControllerDisconnectOverlay };
