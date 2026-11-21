/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import type { ReportingAsLineProps } from './ReportingAsLine.type';
import './ReportingAsLine.css';

const ReportingAsLine = (props: ReportingAsLineProps) => {
  const t = useT();
  const { displayName, githubHandle } = props;
  const who = githubHandle ? `${displayName} (@${githubHandle})` : displayName;

  return (
    <Text as="p" className="reporting-as">
      <Text as="span" tone="faint" className="reporting-as__label">{t('compounds:reporting-as-line.label')}</Text>
      <Text as="span" className="reporting-as__who">{who}</Text>
    </Text>
  );
};

export { ReportingAsLine };
