/* @layer renderer-components @kind component */
/**
 * A settings tab: one header line (glowing icon, title, section anchors) over
 * a scene backdrop, with the settings scrolling on their own beneath it. Once
 * the settings scroll, the header compacts but stays in place.
 */
import { useMemo } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import { Text } from '../../../../design-system/primitives/Text';
import { useScrollSpy } from './behavior/useScrollSpy';
import type { SettingsPageAnchor, SettingsPageProps } from './SettingsPage.type';
import './SettingsPage.css';

const NO_ANCHORS: SettingsPageAnchor[] = [];

const SettingsPage = (props: SettingsPageProps) => {
  const { icon, title, backdrop, anchors = NO_ANCHORS, scroll = true, children } = props;
  const ids = useMemo(() => anchors.map((a) => a.id), [anchors]);
  const { bodyRef, activeId, compact, jumpTo } = useScrollSpy(ids);

  return (
    <Box as="section" className={`settings-page${compact ? ' settings-page--compact' : ''}`} aria-label={title}>
      <Box as="header" className="settings-page__head">
        <Box className="settings-page__backdrop">{backdrop}</Box>
        <Box as="span" className="settings-page__icon" aria-hidden="true">{icon}</Box>
        <Text as="h2" className="settings-page__title">{title}</Text>
        {anchors.length > 1 && (
          <Box as="nav" className="settings-page__anchors" aria-label={`${title} sections`}>
            {anchors.map((anchor) => (
              <Button
                key={anchor.id}
                variant="bare"
                className={`settings-page__anchor${anchor.id === activeId ? ' settings-page__anchor--active' : ''}`}
                onClick={() => jumpTo(anchor.id)}
              >
                {anchor.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
      <Box ref={bodyRef} className={`settings-page__body${scroll ? '' : ' settings-page__body--fixed'}`}>
        {children}
      </Box>
    </Box>
  );
};

export { SettingsPage };
