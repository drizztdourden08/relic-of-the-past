/* @layer renderer-components @kind component */
import { Card, Grid } from '@drizztdourden08/tessera/primitives';
import type { DashboardCardProps } from './DashboardCard.type';

const DashboardCard = (props: DashboardCardProps) => {
  const { placement, title, subtitle, actions, className, children } = props;

  return (
    <Grid.Cell span={placement?.span} data-section={placement?.section}>
      <Card title={title} subtitle={subtitle} actions={actions} className={className}>{children}</Card>
    </Grid.Cell>
  );
};

export { DashboardCard };
