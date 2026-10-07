/* @layer renderer-components @kind component */
/**
 * A settings tab: one header line (glowing icon, title, then the section anchors or the
 * host's own view tabs) over an optional scene backdrop, with the settings scrolling on
 * their own beneath it. Once the settings scroll, the header compacts but stays in place.
 */
import { useMemo } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { HeaderTabs } from '../../../../design-system/composites/HeaderTabs';
import { useScrollSpy } from './behavior/useScrollSpy';
import type { SettingsPageAnchor, SettingsPageProps } from './SettingsPage.type';
import './SettingsPage.css';

const NO_ANCHORS: SettingsPageAnchor[] = [];
const TABS_CLASS = 'settings-page__tabs';

const SettingsPage = (props: SettingsPageProps) => {
  const { icon, title, backdrop, anchors = NO_ANCHORS, tabs, scroll = true, actions, children } = props;
  const ids = useMemo(() => anchors.map((a) => a.id), [anchors]);
  const { bodyRef, activeId, compact, jumpTo } = useScrollSpy(ids);

  const strip = tabs
    ? <HeaderTabs className={TABS_CLASS} items={tabs.items} activeId={tabs.activeId} onSelect={tabs.onSelect} ariaLabel={`${title} views`} />
    : anchors.length > 1 && (
      <HeaderTabs className={TABS_CLASS} items={anchors} activeId={activeId} onSelect={jumpTo} ariaLabel={`${title} sections`} />
    );

  return (
    <Box as="section" className={`settings-page${compact ? ' settings-page--compact' : ''}`} aria-label={title}>
      <Box as="header" className="settings-page__head">
        <Box className="settings-page__backdrop">{backdrop}</Box>
        <Box as="span" className="settings-page__icon" aria-hidden="true">{icon}</Box>
        <Text as="h2" className="settings-page__title">{title}</Text>
        {strip}
        {actions && <Box className="settings-page__actions">{actions}</Box>}
      </Box>
      <Box ref={bodyRef} className={`settings-page__body${scroll ? '' : ' settings-page__body--fixed'}`}>
        {children}
      </Box>
    </Box>
  );
};

export { SettingsPage };
