/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';

interface ReportSectionProps {
  label: string;
  text: string;
}

/** Collapsible text block — same pattern as the bug report's debug-info preview,
 *  reused here so a dense controller report doesn't read as an unreadable wall of text. */
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
