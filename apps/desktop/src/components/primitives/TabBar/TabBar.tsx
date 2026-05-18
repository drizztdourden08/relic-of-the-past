import './TabBar.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabBar = (props: TabBarProps) => {
  const { tabs, activeTab, onTabChange } = props;

  return (
    <nav className="tab-bar" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-bar__tab ${activeTab === tab.id ? 'tab-bar__tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="tab-bar__icon">{tab.icon}</span>}
          <span className="tab-bar__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
