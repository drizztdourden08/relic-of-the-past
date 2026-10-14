/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, ColorSwatch, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { ColorPickerPopover } from '@drizztdourden08/tessera/color-picker-popover';
import { EngineToggle } from './EngineToggle';
import { GapCells } from './GapCells';
import { LayoutSettingsPiece } from './LayoutSettingsPiece';
import { SubSection } from './SubSection';
import { TOOLBAR_ICONS } from '@app/hud-layout-editing/toolbar-menus';
import { OVERLAY_LABEL } from './LayoutSettings.constants';
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
              <Icon icon={TOOLBAR_ICONS.gridView} size={16} aria-hidden />
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
          <GapCells gap={gap} onGap={onGap} scope={scope} insideRepeat={insideRepeat} />
        </LayoutSettingsPiece>
      </Box>
    </SubSection>
  );
};

export { LayoutSettings };
