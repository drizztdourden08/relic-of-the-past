/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { SoundListHeader } from './SoundListHeader';
import { StudioDetailsLayout } from './StudioDetailsLayout';
import type { SoundPanelShellProps } from './SoundPanelShell.type';

const SoundPanelShell = (props: SoundPanelShellProps) => {
  const { editorLabel, toolbar, detail, header, children } = props;

  return (
    <StudioDetailsLayout editorLabel={editorLabel} toolbar={toolbar} detail={detail}>
      <Box className="msu-panel">
        <SoundListHeader {...header} />
        {children}
      </Box>
    </StudioDetailsLayout>
  );
};

export { SoundPanelShell };
