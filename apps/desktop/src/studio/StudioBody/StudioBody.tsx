/* @layer renderer-components @kind component */
import { Box, DensityScope, ToolFrame } from '@drizztdourden08/tessera/primitives';
import { StudioSidePanel } from './sub-components/StudioSidePanel';
import type { StudioBodyProps } from './StudioBody.type';
import './StudioBody.css';

const StudioBody = (props: StudioBodyProps) => {
  const { editorLabel, toolbar, start, end, children } = props;

  const bar = toolbar && (
    <DensityScope density="compact">
      <Box className="studio-body__toolbar">{toolbar}</Box>
    </DensityScope>
  );

  return (
    <Box className="studio-body">
      {start && <StudioSidePanel side="start" panel={start} />}
      <ToolFrame as="section" aria-label={editorLabel} padded toolbar={bar} className="studio-body__editor">
        {children}
      </ToolFrame>
      {end && <StudioSidePanel side="end" panel={end} />}
    </Box>
  );
};

export { StudioBody };
