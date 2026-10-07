/* @layer renderer-components @kind component */
/**
 * A dashboard: panels as cards on columns no narrower than --dashboard-col-min, as many
 * columns as the width holds, so a wide window sets several panels side by side
 * at a readable width and only a narrow one stacks them. A panel may take two
 * columns or the whole row (DashboardPanel's `span`); a smaller panel later in
 * the order fills a hole a wide one left. Panels in a row share its height.
 *
 * The outer box is the size container the span rule measures, since a grid
 * cannot query its own width.
 */
import { Box } from '../../primitives/Box';
import type { DashboardGridProps } from './DashboardGrid.type';
import './DashboardGrid.css';

const DashboardGrid = (props: DashboardGridProps) => {
  const { children, className = '' } = props;

  return (
    <Box className={`dashboard-grid${className ? ` ${className}` : ''}`}>
      <Box className="dashboard-grid__cells">{children}</Box>
    </Box>
  );
};

export { DashboardGrid };
