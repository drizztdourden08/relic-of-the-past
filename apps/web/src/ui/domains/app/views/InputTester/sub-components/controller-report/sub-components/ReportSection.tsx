/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';

interface ReportSectionProps {
  label: string;
  text: string;
}

/** Collapsible text block, the same pattern as the bug report's debug-info preview. */
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
export type { ReportSectionProps };
