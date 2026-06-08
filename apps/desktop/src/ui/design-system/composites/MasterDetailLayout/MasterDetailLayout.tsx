/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import './MasterDetailLayout.css';
import type { MasterDetailLayoutProps } from './MasterDetailLayout.type';

/** Two-column master/detail: a scrollable left list and a right detail panel. */
const MasterDetailLayout = (props: MasterDetailLayoutProps) => {
  const { list, detail, detailEmpty, className = '' } = props;
  return (
    <Box className={`master-detail${className ? ` ${className}` : ''}`}>
      <Box className="master-detail__list">{list}</Box>
      <Box className={`master-detail__detail${detailEmpty ? ' master-detail__detail--empty' : ''}`}>
        {detail}
      </Box>
    </Box>
  );
};

export { MasterDetailLayout };
