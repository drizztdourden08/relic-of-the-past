/* @layer renderer-components @kind component */
/**
 * A row of tabs that scrolls sideways once it runs out of room.
 *
 * The strip itself stays presentational: the measuring, the wheel gesture and
 * the movement all live in `behavior/useTabStripOverflow`, and this file only
 * decides what to draw from the two edge flags it reports. A strip whose tabs
 * fit draws neither pager and behaves exactly as an un-scrolling row does.
 */
import './TabBar.css';
import { IconButton } from '../IconButton';
import { tabIndexForKey } from './behavior/tab-index-for-key';
import { useTabStripOverflow } from './behavior/useTabStripOverflow';
import { type TabBarProps } from './TabBar.type';
import type { KeyboardEvent } from 'react';

const pagerClass = (enabled: boolean): string =>
  `tab-bar__pager${enabled ? '' : ' tab-bar__pager--idle'}`;

const TabBar = (props: TabBarProps) => {
  const { tabs, activeTab, onTabChange, iconOnly = false } = props;
  const strip = useTabStripOverflow(tabs.length);

  // The arrows / Home / End move along the strip and take the selection with
  // them, so the strip is operable without a pointer. Moving the focus is what
  // brings the tab into view, and the browser's own focus scroll is suppressed so
  // the strip's smooth one is the only movement.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const next = tabIndexForKey(event.key, index, tabs.length);
    if (next === null || next === index) return;
    event.preventDefault();
    onTabChange(tabs[next].id);
    const sibling = event.currentTarget.parentElement?.children[next];
    if (!(sibling instanceof HTMLElement)) return;
    sibling.focus({ preventScroll: true });
    strip.revealTab(sibling);
  };

  return (
    <nav className="tab-bar" ref={strip.rootRef}>
      {strip.isOverflowing && (
        <IconButton
          type="button"
          className={pagerClass(strip.canScrollBack)}
          label="Show earlier tabs"
          disabled={!strip.canScrollBack}
          onClick={() => strip.pageBy(-1)}
        >
          ‹
        </IconButton>
      )}

      <div className="tab-bar__strip" role="tablist" ref={strip.stripRef} onScroll={strip.handleScroll}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-bar__tab ${activeTab === tab.id ? 'tab-bar__tab--active' : ''}`}
            title={iconOnly ? tab.label : undefined}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.icon && <span className="tab-bar__icon">{tab.icon}</span>}
            {!iconOnly && <span className="tab-bar__label">{tab.label}</span>}
            {tab.badge != null && <span className="tab-bar__badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {strip.isOverflowing && (
        <IconButton
          type="button"
          className={pagerClass(strip.canScrollForward)}
          label="Show later tabs"
          disabled={!strip.canScrollForward}
          onClick={() => strip.pageBy(1)}
        >
          ›
        </IconButton>
      )}
    </nav>
  );
};

export {
  TabBar,
};
