/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { ColorSwatch } from '@ds/primitives/ColorSwatch';
import { IconButton } from '@ds/primitives/IconButton';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Text } from '@ds/primitives/Text';
import { ColorPickerPopover } from '@ds/composites/ColorPickerPopover';
import { EngineToggle } from './EngineToggle';
import { LayoutSettingsPiece } from './LayoutSettingsPiece';
import { SubSection } from './SubSection';
import { ValueField } from './ValueField';
import { TOOLBAR_ICONS } from '../behavior/toolbar-menus';
import { OVERLAY_LABEL } from './LayoutSettings.constants';
import './HudLayoutEditor.layout.css';
import type { LayoutSettingsProps } from './LayoutSettings.type';

const LayoutSettings = (props: LayoutSettingsProps) => {
  const { engine, onSetEngine, overlay, gap, onGap, scope, insideRepeat } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <SubSection title="Container">
      <Box className="hud-layout-set">
        <LayoutSettingsPiece label="Type">
          <EngineToggle value={engine} onChange={onSetEngine} />
        </LayoutSettingsPiece>

        <LayoutSettingsPiece label="Overlay">
          <Box ref={anchorRef} className="hud-layout-set__overlay">
            <ColorSwatch
              size="sm"
              color={overlay.guide}
              aria-label="Open the guide colour picker"
              title="Guide colour for this container's own overlay, in the preview and in this panel"
              onClick={() => setOpen(true)}
            />
            <IconButton
              variant="ghost"
              size="sm"
              active={overlay.overlayOn}
              label={OVERLAY_LABEL}
              title={OVERLAY_LABEL}
              data-action="grid-overlay"
              onClick={overlay.onToggleOverlay}
            >
              <IconifyIcon icon={TOOLBAR_ICONS.gridView} width={16} height={16} aria-hidden />
            </IconButton>
            <ColorPickerPopover
              open={open}
              anchorRef={anchorRef}
              value={overlay.guide}
              onChange={overlay.onGuide}
              onClose={() => setOpen(false)}
            />
          </Box>
        </LayoutSettingsPiece>

        <LayoutSettingsPiece label="Gap" grow>
          <Box className="hud-layout-set__gaps">
            {gap.map((cell) => (
              <Box key={cell.axis} className="hud-layout-set__gap">
                <Text className="hud-layout-set__cap" aria-hidden>{cell.cap}</Text>
                <ValueField
                  aria-label={cell.label}
                  value={cell.value}
                  onChange={(next) => onGap(cell.axis, next)}
                  scope={scope}
                  insideRepeat={insideRepeat}
                  min={0}
                />
              </Box>
            ))}
          </Box>
        </LayoutSettingsPiece>
      </Box>
    </SubSection>
  );
};

export { LayoutSettings };
