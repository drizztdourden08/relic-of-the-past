/* @layer renderer-components @kind component */
/**
 * ControlsTabs is the controls screen's tab strip, with disabled tabs.
 *
 * The two binding tabs gate each other: under Modern the Game Controls tab is
 * greyed, under Classic the Modern Controls tab is. Greyed, not removed, is
 * the agreed behaviour, because a tab that vanishes when you flip a segmented
 * control reads as the screen having lost something. The reason is shown
 * under the strip and on the tab's own tooltip, so it is legible
 * without hovering.
 *
 * The DS TabBar has no disabled state and belongs to another owner, so the
 * strip is built here from Button primitives instead of widening it.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { ControlsTab } from '../controls-settings';
import './ControlsTabs.css';

interface ControlsTabItem {
  id: ControlsTab;
  label: string;
  disabled?: boolean;
  /** One line, shown on the tab and under the strip. */
  reason?: string;
}

interface ControlsTabsProps {
  tabs: readonly ControlsTabItem[];
  activeTab: ControlsTab;
  onTabChange: (tab: ControlsTab) => void;
}

const ControlsTabs = ({ tabs, activeTab, onTabChange }: ControlsTabsProps) => {
  const blocked = tabs.find((tab) => tab.disabled && tab.reason);

  return (
    <Box className="controls-tabs">
      <Box className="controls-tabs__strip" role="tablist">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="bare"
            role="tab"
            aria-selected={activeTab === tab.id}
            disabled={tab.disabled}
            title={tab.disabled ? tab.reason : undefined}
            className={`controls-tabs__tab ${activeTab === tab.id ? 'controls-tabs__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </Box>
      {blocked && <Text variant="caption" className="controls-tabs__reason">{blocked.reason}</Text>}
    </Box>
  );
};

export { ControlsTabs };
export type { ControlsTabItem };
