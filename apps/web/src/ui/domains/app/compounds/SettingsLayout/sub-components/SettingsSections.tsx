/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DisabledOverlay, SettingsSection } from '@drizztdourden08/tessera/composites';
import type { SettingsGroupData, SettingsLock } from '@drizztdourden08/tessera/composites';
import { DISABLED_SETTING_MESSAGES } from '@domains/app/disabled-setting-messages.constants';
import { changedKeys } from '../behavior/changed-keys';
import { defaultsPatch } from '../behavior/defaults-patch';
import { SettingToggle } from './SettingToggle';
import type { ItemGroup, SettingsSectionsProps } from '../SettingsLayout.type';

const SettingsSections = (props: SettingsSectionsProps) => {
  const { sections, settings, defaults, onChange, renderControl, isDisabled, onOpenVanillaSafeSettings, lockCauseOf, isLockedKey } = props;

  const groupOf = (group: ItemGroup): SettingsGroupData => ({
    id: group.id ?? undefined,
    title: group.title ?? undefined,
    rows: group.items.map((item) => ({
      id: item.key,
      hint: item.description,
      description: item.description,
      keywords: item.keywords,
      lock: lockCauseOf(item.key),
      content: renderControl?.(item.key, settings, onChange)
        ?? <SettingToggle item={item} settings={settings} disabled={isDisabled?.(item.key, settings) ?? false} onChange={onChange} />,
    })),
  });

  const renderLock = useCallback(({ cause, children }: SettingsLock) => (
    <DisabledOverlay
      active
      contained
      message={DISABLED_SETTING_MESSAGES[cause]}
      onOpenSettings={cause === 'randomizer' ? undefined : (onOpenVanillaSafeSettings ?? (() => {}))}
    >
      {children}
    </DisabledOverlay>
  ), [onOpenVanillaSafeSettings]);

  return (
    <Box className="settings-layout__sections">
      {sections.map((section) => {
        const resettable = defaults ? changedKeys(section.groups, settings, defaults, isLockedKey) : [];
        return (
          <SettingsSection
            key={section.id}
            id={section.id}
            title={section.title}
            groups={section.groups.map(groupOf)}
            changedCount={resettable.length}
            onReset={defaults ? () => onChange(defaultsPatch(resettable, settings, defaults)) : undefined}
            renderLock={renderLock}
          />
        );
      })}
    </Box>
  );
};

export { SettingsSections };
