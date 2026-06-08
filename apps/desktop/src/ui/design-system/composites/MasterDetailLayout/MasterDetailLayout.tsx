/* @layer renderer-components @kind component */
import './MasterDetailLayout.css';
import type { MasterDetailLayoutProps } from './MasterDetailLayout.type';

/** Two-column master/detail: a scrollable left list and a right detail panel. */
const MasterDetailLayout = (props: MasterDetailLayoutProps) => {
  const { list, detail, detailEmpty, className = '' } = props;
  return (
    <div className={`master-detail${className ? ` ${className}` : ''}`}>
      <div className="master-detail__list">{list}</div>
      <div className={`master-detail__detail${detailEmpty ? ' master-detail__detail--empty' : ''}`}>
        {detail}
      </div>
    </div>
  );
};

export { MasterDetailLayout };
