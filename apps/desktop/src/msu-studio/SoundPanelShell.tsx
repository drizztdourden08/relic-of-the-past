/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { StudioLayout } from '@drizztdourden08/tessera/composites';
import { STUDIO_EDITOR_MIN_WIDTH, StudioPanelContent } from '@app/studio';
import { SoundListHeader } from './SoundListHeader';
import { DETAILS_PANEL } from './studio-frame/studio-frame.constants';
import type { SoundPanelShellProps } from './SoundPanelShell.type';

const SoundPanelShell = (props: SoundPanelShellProps) => {
  const { editorLabel, toolbar, detail, header, children } = props;

  return (
    <StudioLayout
      editorLabel={editorLabel}
      compactToolbar
      editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}
      toolbar={toolbar}
      end={{ ...DETAILS_PANEL, content: <StudioPanelContent>{detail}</StudioPanelContent> }}
    >
      <Box className="msu-panel">
        <SoundListHeader {...header} />
        {children}
      </Box>
    </StudioLayout>
  );
};

export { SoundPanelShell };
