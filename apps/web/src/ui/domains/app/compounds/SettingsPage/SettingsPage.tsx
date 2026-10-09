/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { HeaderAnchorNav } from '@drizztdourden08/tessera/composites';
import { useScrollSpy } from './behavior/useScrollSpy';
import { NO_ANCHORS, TABS_CLASS } from './SettingsPage.constants';
import type { SettingsPageProps } from './SettingsPage.type';
import './SettingsPage.css';

const SettingsPage = (props: SettingsPageProps) => {
  const { icon, title, backdrop, anchors = NO_ANCHORS, tabs, scroll = true, actions, children } = props;
  const ids = useMemo(() => anchors.map((a) => a.id), [anchors]);
  const { bodyRef, activeId, compact, jumpTo } = useScrollSpy(ids);

  const strip = tabs
    ? <HeaderAnchorNav className={TABS_CLASS} items={tabs.items} activeId={tabs.activeId} onSelect={tabs.onSelect} ariaLabel={`${title} views`} />
    : anchors.length > 1 && (
      <HeaderAnchorNav className={TABS_CLASS} items={anchors} activeId={activeId} onSelect={jumpTo} ariaLabel={`${title} sections`} />
    );

  return (
    <Box as="section" className={`settings-page${compact ? ' content-header--compact' : ''}`} aria-label={title}>
      <Box as="header" className="content-header">
        <Box className="content-header__backdrop">{backdrop}</Box>
        <Box as="span" className="content-header__icon" aria-hidden="true">{icon}</Box>
        <Text as="h2" className="content-header__title">{title}</Text>
        {strip}
        {actions && <Box className="content-header__actions">{actions}</Box>}
      </Box>
      <Box ref={bodyRef} className={`settings-page__body${scroll ? '' : ' screen-page__body--fixed'}`}>
        {children}
      </Box>
    </Box>
  );
};

export { SettingsPage };
