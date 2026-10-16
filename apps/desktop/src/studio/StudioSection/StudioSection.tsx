/* @layer renderer-components @kind component */
import { useId } from 'react';
import { Box, SectionHeader } from '@drizztdourden08/tessera/primitives';
import type { StudioSectionProps } from './StudioSection.type';
import './StudioSection.css';

const StudioSection = (props: StudioSectionProps) => {
  const { title, action, children } = props;
  const headingId = useId();

  return (
    <Box as="section" aria-labelledby={headingId} className="studio-section">
      <SectionHeader title={<Box as="span" id={headingId}>{title}</Box>} action={action} level={3} />
      {children}
    </Box>
  );
};

export { StudioSection };
