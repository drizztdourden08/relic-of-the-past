/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { ReportSectionProps } from '../controller-report.type';

const ReportSection = (props: ReportSectionProps) => {
  const { label, text } = props;

  return (
    <Box as="details" className="controller-report__section">
      <Box as="summary">{label}</Box>
      <Box as="pre" className="controller-report__section-text">{text}</Box>
    </Box>
  );
};

export { ReportSection };
