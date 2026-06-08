/* @layer renderer-components @kind component */
import './SectionHeader.css';
import type { SectionHeaderProps } from './types';

const SectionHeader = (props: SectionHeaderProps) => {
  const { title, subtitle, action, className = '' } = props;
  return (
    <div className={`section-header${className ? ` ${className}` : ''}`}>
      <div className="section-header__text">
        <div className="section-header__title">{title}</div>
        {subtitle != null && <div className="section-header__subtitle">{subtitle}</div>}
      </div>
      {action != null && <div className="section-header__action">{action}</div>}
    </div>
  );
};

export { SectionHeader };
