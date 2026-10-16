/* @layer renderer-components @kind component */
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { StateList, ViewerStage } from '@rotp/design/packs';
import { EMPTY_EDITOR } from '../PlayerSpriteStudio.constants';
import type { SpriteWorkspaceProps } from '../PlayerSpriteStudio.type';

const SpriteWorkspace = (props: SpriteWorkspaceProps) => {
  const { sheet, wearing, viewer } = props;

  if (!sheet) return <EmptyState message={EMPTY_EDITOR} />;

  return (
    <Box className="sprite-workspace">
      {viewer.view === 'state' && <StateList selected={viewer.action} onSelect={viewer.setAction} />}
      <Box className="sprite-workspace__stage">
        <ViewerStage sheet={sheet} wearing={wearing} viewer={viewer} />
      </Box>
    </Box>
  );
};

export { SpriteWorkspace };
