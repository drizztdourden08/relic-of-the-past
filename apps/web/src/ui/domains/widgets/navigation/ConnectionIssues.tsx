/* @layer renderer-widgets @kind component */
/**
 * Renders a connection's completeness warnings under its editor item. When a
 * connection is complete (no issues) a subtle check is shown instead of a
 * silent blank.
 */

import { Box, Text } from '../../../design-system/primitives';

interface ConnectionIssuesProps {
  issues: string[];
}

const ConnectionIssues = (props: ConnectionIssuesProps) => {
  const { issues } = props;

  if (issues.length === 0) {
    return <Text className="conn-editor__item-ok">✓ complete</Text>;
  }

  return (
    <Box className="conn-editor__item-issues">
      {issues.map(issue => (
        <Text key={issue} className="conn-editor__item-issue">{issue}</Text>
      ))}
    </Box>
  );
};

export { ConnectionIssues };
