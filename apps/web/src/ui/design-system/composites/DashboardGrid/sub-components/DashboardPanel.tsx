/* @layer renderer-components @kind component */
/**
 * One panel of a dashboard: a card with a section header (title, optional
 * subtitle, an action at the right) over its body. Outside a DashboardGrid it
 * is a plain titled card, and its span does nothing.
 */
import { Box } from '../../../primitives/Box';
import { Card } from '../../../primitives/Card';
import { SectionHeader } from '../../../primitives/SectionHeader';
import type { DashboardPanelProps } from '../DashboardGrid.type';
import '../DashboardGrid.css';

const DashboardPanel = (props: DashboardPanelProps) => {
  const { title, subtitle, action, span = 1, section, className = '', children } = props;

  return (
    <Card className={`dashboard-panel${className ? ` ${className}` : ''}`} data-span={span} data-section={section}>
      <SectionHeader title={title} subtitle={subtitle} action={action} />
      {children !== undefined && <Box className="dashboard-panel__body">{children}</Box>}
    </Card>
  );
};

export { DashboardPanel };
