/* @layer renderer-components @kind component */
﻿import './TabBar.css';
import { type TabItem, type TabBarProps } from './TabBar.type';



const TabBar = (props: TabBarProps) => {
  const { tabs, activeTab, onTabChange, iconOnly = false } = props;

  return (
    <nav className="tab-bar" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-bar__tab ${activeTab === tab.id ? 'tab-bar__tab--active' : ''}`}
          title={iconOnly ? tab.label : undefined}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="tab-bar__icon">{tab.icon}</span>}
          {!iconOnly && <span className="tab-bar__label">{tab.label}</span>}
          {tab.badge != null && <span className="tab-bar__badge">{tab.badge}</span>}
        </button>
      ))}
    </nav>
  );
};

export {
  TabBar,
};
