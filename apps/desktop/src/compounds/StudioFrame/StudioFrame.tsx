/* @layer renderer-components @kind component */
import { Box, HintScope } from '@drizztdourden08/tessera/primitives';
import { StudioEditor } from './sub-components/StudioEditor';
import { StudioPanel } from './sub-components/StudioPanel';
import { StudioTopBar } from './sub-components/StudioTopBar';
import type { StudioFrameProps } from './StudioFrame.type';
import './StudioFrame.css';

const StudioFrame = (props: StudioFrameProps) => {
  const { caption, title, status, groups, idleHint, notices, banner, left, right, editorLabel, toolbar, children, className } = props;

  return (
    <HintScope>
      <Box className={`studio-frame${className ? ` ${className}` : ''}`}>
        <StudioTopBar caption={caption} title={title} status={status} groups={groups} idleHint={idleHint} notices={notices} />
        {banner}
        <Box className="studio-frame__body">
          {left && <StudioPanel side="left" spec={left} />}
          <StudioEditor label={editorLabel} toolbar={toolbar}>{children}</StudioEditor>
          {right && <StudioPanel side="right" spec={right} />}
        </Box>
      </Box>
    </HintScope>
  );
};

export { StudioFrame };
