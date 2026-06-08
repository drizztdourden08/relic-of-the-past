/* @layer renderer-components @kind component */
﻿import { useState, useRef, useCallback, useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Toggle } from '../../../../design-system/primitives/Toggle';
import { TextInput } from '../../../../design-system/primitives/TextInput';
import './SettingsLayout.css';
import { type SettingItem, type SettingsLayoutProps } from './SettingsLayout.type';

const SettingsLayout = (props: SettingsLayoutProps) => {
  const {
    sections,
    settings,
    onChange,
    renderControl,
    isDisabled,
  } = props;
  const [filter, setFilter] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((id: string) => {
    const el = contentRef.current?.querySelector(`[data-section="${id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  return (
    <Box className="settings-view">
      <Box as="nav" className="settings-view__sidebar">
        <Box className="settings-view__search">
          <TextInput
            type="text"
            className="settings-view__search-input"
            placeholder="Search settings…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <Box
              as="button"
              className="settings-view__search-clear"
              onClick={() => setFilter('')}
              aria-label="Clear search"
            >
              ×
            </Box>
          )}
        </Box>
        <Box className="settings-view__toc">
          {filteredSections.map((section) => (
            <Box key={section.id} className="settings-view__toc-section">
              <Box
                as="button"
                className="settings-view__toc-heading"
                onClick={() => scrollTo(section.id)}
              >
                {section.title}
              </Box>
              {section.subsections.map((sub) => (
                <Box
                  as="button"
                  key={sub.id}
                  className="settings-view__toc-sub"
                  onClick={() => scrollTo(sub.id)}
                >
                  {sub.title}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <Box className="settings-view__content" ref={contentRef}>
        {filteredSections.length === 0 && (
          <Box className="settings-view__empty">
            No settings match "{filter}"
          </Box>
        )}
        {filteredSections.map((section) => (
          <Box key={section.id} className="settings-view__section" data-section={section.id}>
            <Text as="h2" className="settings-view__section-title">{section.title}</Text>
            {section.subsections.map((sub) => (
              <Box key={sub.id} className="settings-view__subsection" data-section={sub.id}>
                <Text as="h3" className="settings-view__subsection-title">{sub.title}</Text>
                <Box className="settings-view__group">
                  {sub.items.map((item) => {
                    const custom = renderControl?.(item.key, settings, onChange);
                    if (custom) return <Box key={item.key}>{custom}</Box>;
                    return <Box key={item.key}>{renderToggle(item.key, item)}</Box>;
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export {
  SettingsLayout,
};
