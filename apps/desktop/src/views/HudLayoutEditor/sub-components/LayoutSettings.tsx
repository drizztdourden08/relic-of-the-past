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
import { useT, useText } from '@drizztdourden08/brock-react';

const LayoutSettings = (props: LayoutSettingsProps) => {
  const t = useT();
  const text = useText();
  const { engine, onSetEngine, overlay, gap, onGap, scope, insideRepeat } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <SubSection title={t('hud-editor:layout-settings.title.container')}>
      <Box className="hud-layout-set">
        <LayoutSettingsPiece label={t('hud-editor:layout-settings.label.type')}>
          <EngineToggle value={engine} onChange={onSetEngine} />
        </LayoutSettingsPiece>

        <LayoutSettingsPiece label={t('hud-editor:layout-settings.label.overlay')}>
          <Box ref={anchorRef} className="hud-layout-set__overlay">
            <ColorSwatch
              size="sm"
              color={overlay.guide}
              aria-label={t('hud-editor:layout-settings.aria.open-the-guide-colour-picker')}
              title={t('hud-editor:layout-settings.title.guide-colour-for-this-container')}
              onClick={() => setOpen(true)}
            />
            <IconButton
              variant="ghost"
              size="sm"
              active={overlay.overlayOn}
              label={text(OVERLAY_LABEL)}
              title={text(OVERLAY_LABEL)}
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

        <LayoutSettingsPiece label={t('hud-editor:layout-settings.label.gap')} grow>
          <GapCells gap={gap} onGap={onGap} scope={scope} insideRepeat={insideRepeat} />
        </LayoutSettingsPiece>
      </Box>
    </SubSection>
  );
};

export { LayoutSettings };
