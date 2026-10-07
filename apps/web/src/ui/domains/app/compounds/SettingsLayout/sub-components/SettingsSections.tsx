/* @layer renderer-components @kind component */
/** The sections, subsections and rows of one settings tab, with lock overlays and per-section reset. */
import type { GameSettings } from '@shared/types/settings';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Toggle } from '../../../../../design-system/primitives/Toggle';
import { DisabledOverlay } from '../../../../../design-system/composites/DisabledOverlay';
import { DISABLED_SETTING_MESSAGES } from '../../../../../design-system/composites/DisabledOverlay/DisabledOverlay.constants';
import { partitionByLockState } from '../behavior/partitionByLockState';
import { changedKeys, defaultsPatch } from '../behavior/sectionDefaults';
import { SectionHeading } from './SectionHeading';
import type { ResolvedSection } from '../behavior/resolveSections';
import type { SettingItem, SettingLockCause, SettingsLayoutProps } from '../SettingsLayout.type';

type SettingsSectionsProps = Omit<SettingsLayoutProps, 'sections'> & {
  sections: ResolvedSection[];
  lockCauseOf: (key: string) => SettingLockCause | null;
  isLockedKey: (key: string) => boolean;
};

const SettingsSections = (props: SettingsSectionsProps) => {
  const { sections, settings, defaults, onChange, renderControl, isDisabled, onOpenVanillaSafeSettings, lockCauseOf, isLockedKey } = props;

  const renderToggle = (key: string, item: SettingItem) => {
    const val = (settings as unknown as Record<string, unknown>)[key];
    if (typeof val !== 'boolean') return null;
    return (
      <Toggle
        label={item.label}
        description={item.description}
        checked={val}
        onChange={(v) => onChange({ [key]: v } as Partial<GameSettings>)}
        disabled={isDisabled?.(key, settings) ?? false}
        link={item.link}
      />
    );
  };

  return (
    <Box className="settings-layout__sections">
      {sections.map((section) => {
        // A search narrows a section to the rows it still shows, and the reset follows that:
        // it offers exactly the settings in front of the reader, never hidden ones.
        const resettable = defaults ? changedKeys(section.groups, settings, defaults, isLockedKey) : [];
        return (
          <Box key={section.id} className="settings-layout__section" data-section={section.id}>
            {defaults
              ? (
                <SectionHeading
                  title={section.title}
                  changedCount={resettable.length}
                  onReset={() => onChange(defaultsPatch(resettable, settings, defaults))}
                />
              )
              : <Text as="h2" className="settings-layout__section-title">{section.title}</Text>}
            {section.groups.map((group, groupIndex) => (
              <Box key={group.id ?? groupIndex} className="settings-layout__subsection" data-section={group.id ?? undefined}>
                {group.title && <Text as="h3" className="settings-layout__subsection-title">{group.title}</Text>}
                <Box className="settings-layout__group">
                  {partitionByLockState(group.items, lockCauseOf).map((run, runIndex) => {
                    const rows = run.items.map((item) => (
                      <Box key={item.key} data-setting-key={item.key} className="settings-layout__row">
                        {renderControl?.(item.key, settings, onChange) ?? renderToggle(item.key, item)}
                      </Box>
                    ));
                    if (!run.lock) return rows;
                    // The randomizer lock is permanent for the profile, so it names its cause
                    // and offers no action; the Vanilla Safe lock keeps its deep-link default.
                    return (
                      <DisabledOverlay
                        key={`locked-${runIndex}`}
                        active
                        contained
                        message={run.lock === 'randomizer' ? DISABLED_SETTING_MESSAGES.randomizer : undefined}
                        onOpenSettings={run.lock === 'randomizer' ? undefined : (onOpenVanillaSafeSettings ?? (() => {}))}
                      >
                        {rows}
                      </DisabledOverlay>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export { SettingsSections };
