/* @layer renderer-components @kind component */
import { Text } from '@ds/primitives';
import type { ReportingAsLineProps } from './ReportingAsLine.type';
import './ReportingAsLine.css';

/** Who a report is filed as, in place of the email field once the app is signed in. */
const ReportingAsLine = (props: ReportingAsLineProps) => {
  const { displayName, githubHandle } = props;
  const who = githubHandle ? `${displayName} (@${githubHandle})` : displayName;

  return (
    <Text as="p" className="reporting-as">
      <Text as="span" className="reporting-as__label">reporting as</Text>
      <Text as="span" className="reporting-as__who">{who}</Text>
      <Text as="span" className="reporting-as__hint"> · change in Contributor</Text>
    </Text>
  );
};

export { ReportingAsLine };
