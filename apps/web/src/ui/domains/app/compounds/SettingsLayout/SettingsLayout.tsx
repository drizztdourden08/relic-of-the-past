/* @layer renderer-components @kind component */
import { useState, useRef, useCallback, useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Toggle } from '../../../../design-system/primitives/Toggle';
import { SettingsShell } from '../../../../design-system/composites/SettingsShell';
import './SettingsLayout.css';
import { type SettingItem, type SettingsLayoutProps } from './SettingsLayout.type';

const SettingsLayout = (props: SettingsLayoutProps) => {
  const { sections, settings, onChange, renderControl, isDisabled } = props;
  const [filter, setFilter] = useState('');
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    contentRef.current
      ?.querySelector(`[data-section="${id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const filterLower = filter.toLowerCase();

  const filteredSections = useMemo(() => {
    if (!filterLower) return sections;
    return sections.map((section) => ({
      ...section,
      subsections: section.subsections
        .map((sub) => ({
          ...sub,
          items: sub.items.filter(
            (item) =>
              item.label.toLowerCase().includes(filterLower) ||
              item.description.toLowerCase().includes(filterLower) ||
              (item.keywords ?? '').toLowerCase().includes(filterLower),
          ),
        }))
        .filter((sub) => sub.items.length > 0),
    })).filter((section) => section.subsections.length > 0);
  }, [filterLower, sections]);

  const navGroups = useMemo(
    () => filteredSections.map((section) => ({
      title: section.title,
      items: section.subsections.map((sub) => ({ id: sub.id, label: sub.title })),
    })),
    [filteredSections],
  );

  const renderToggle = (key: string, item: SettingItem) => {
    const val = (settings as unknown as Record<string, unknown>)[key];
    if (typeof val !== 'boolean') return null;
    const disabled = isDisabled?.(key, settings) ?? false;

    return (
      <Toggle
        label={item.label}
        description={item.description}
        checked={val}
        onChange={(v) => onChange({ [key]: v } as Partial<GameSettings>)}
        disabled={disabled}
        link={item.link}
      />
    );
  };

  const nav = {
    groups: navGroups,
    activeId,
    onSelect: scrollTo,
    searchable: true,
    searchPlaceholder: 'Search settings…',
    query: filter,
    onQueryChange: setFilter,
  };

  return (
    <SettingsShell nav={nav} className="settings-layout">
      <Box className="settings-layout__sections" ref={contentRef}>
        {filteredSections.length === 0 && (
          <Box className="settings-layout__empty">No settings match "{filter}"</Box>
        )}
        {filteredSections.map((section) => (
          <Box key={section.id} className="settings-layout__section" data-section={section.id}>
            <Text as="h2" className="settings-layout__section-title">{section.title}</Text>
            {section.subsections.map((sub) => (
              <Box key={sub.id} className="settings-layout__subsection" data-section={sub.id}>
                <Text as="h3" className="settings-layout__subsection-title">{sub.title}</Text>
                <Box className="settings-layout__group">
                  {sub.items.map((item) => {
                    const custom = renderControl?.(item.key, settings, onChange);
                    if (custom) return <Box key={item.key} data-setting-key={item.key}>{custom}</Box>;
                    return <Box key={item.key} data-setting-key={item.key}>{renderToggle(item.key, item)}</Box>;
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </SettingsShell>
  );
};

export {
  SettingsLayout,
};
