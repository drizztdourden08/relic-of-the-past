/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { StudioActionRow } from './sub-components/StudioActionRow';
import type { StudioPaneProps } from './StudioPane.type';
import './StudioPane.css';

const StudioPane = (props: StudioPaneProps) => {
  const { label, actions, status, banner, className, children } = props;

  return (
    <Box as="section" aria-label={label} className={className ? `studio-pane ${className}` : 'studio-pane'}>
      {banner}
      <StudioActionRow label={`${label} actions`} actions={actions} status={status} />
      {children}
    </Box>
  );
};

export { StudioPane };
