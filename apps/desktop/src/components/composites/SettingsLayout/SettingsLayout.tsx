import { useState, useRef, useCallback, useMemo, type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Toggle } from '../../primitives/Toggle';
import './SettingsLayout.css';

// ─── Shared types for section-based settings layouts ───

export interface SettingItem {
  key: string;
  label: string;
  description: string;
  keywords?: string;
  /** Optional external URL to open when an info link is clicked */
  link?: string;
}

export interface SubSection {
  id: string;
  title: string;
  items: SettingItem[];
}

export interface Section {
  id: string;
  title: string;
  subsections: SubSection[];
}

interface SettingsLayoutProps {
  sections: Section[];
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  /** Render a custom control for a given setting key. Return null for default toggle rendering. */
  renderControl?: (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void) => ReactNode | null;
  /** Determine if a toggle should be disabled based on key and settings. */
  isDisabled?: (key: string, settings: GameSettings) => boolean;
}

export function SettingsLayout({
  sections,
  settings,
  onChange,
  renderControl,
  isDisabled,
}: SettingsLayoutProps) {
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
    const val = (settings as Record<string, unknown>)[key];
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
    <div className="settings-view">
      <nav className="settings-view__sidebar">
        <div className="settings-view__search">
          <input
            type="text"
            className="settings-view__search-input"
            placeholder="Search settings…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              className="settings-view__search-clear"
              onClick={() => setFilter('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="settings-view__toc">
          {filteredSections.map((section) => (
            <div key={section.id} className="settings-view__toc-section">
              <button
                className="settings-view__toc-heading"
                onClick={() => scrollTo(section.id)}
              >
                {section.title}
              </button>
              {section.subsections.map((sub) => (
                <button
                  key={sub.id}
                  className="settings-view__toc-sub"
                  onClick={() => scrollTo(sub.id)}
                >
                  {sub.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="settings-view__content" ref={contentRef}>
        {filteredSections.length === 0 && (
          <div className="settings-view__empty">
            No settings match "{filter}"
          </div>
        )}
        {filteredSections.map((section) => (
          <div key={section.id} className="settings-view__section" data-section={section.id}>
            <h2 className="settings-view__section-title">{section.title}</h2>
            {section.subsections.map((sub) => (
              <div key={sub.id} className="settings-view__subsection" data-section={sub.id}>
                <h3 className="settings-view__subsection-title">{sub.title}</h3>
                <div className="settings-view__group">
                  {sub.items.map((item) => {
                    const custom = renderControl?.(item.key, settings, onChange);
                    if (custom) return <div key={item.key}>{custom}</div>;
                    return <div key={item.key}>{renderToggle(item.key, item)}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
