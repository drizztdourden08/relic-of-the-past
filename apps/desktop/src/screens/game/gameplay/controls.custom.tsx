/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { useProfiles, useSettings } from '@drizztdourden08/brock-react';
import type { PageProps, ScreenMeta, SearchEntrySeed } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { ControlsSettings } from '@app/views/ProfileHub/sub-components/ControlsSettings';

const meta: ScreenMeta = { title: msg('data-manager:settings-sections.title.controls'), icon: 'keyboard', showHeader: true, order: 4, fill: true, keywords: ['controls', 'bindings', 'keys', 'gamepad', 'controller', 'buttons'] };

const searchEntries: SearchEntrySeed[] = [
  { label: msg('data-manager:settings-search.input-profiles.label'), keywords: ['input profile', 'bindings set', 'rename', 'new profile'], anchor: 'input-profiles', description: msg('data-manager:settings-search.input-profiles.description') },
  { label: msg('data-manager:settings-search.game-controls.label'), keywords: ['bindings', 'buttons', 'keys', 'classic', 'remap'], anchor: 'bindings', description: msg('data-manager:settings-search.game-controls.description') },
  { label: msg('data-manager:settings-search.shortcuts.label'), keywords: ['shortcut', 'hotkey', 'save state', 'turbo', 'fullscreen', 'screenshot'], anchor: 'bindings', description: msg('data-manager:settings-search.shortcuts.description') },
  { label: msg('data-manager:settings-search.cheat-bindings.label'), keywords: ['cheat', 'hotkey', 'noclip'], anchor: 'bindings', description: msg('data-manager:settings-search.cheat-bindings.description') },
  { label: msg('data-manager:settings-search.controllers.label'), keywords: ['gamepad', 'device', 'controller', 'rescan', 'preset', 'adapter'], anchor: 'devices', description: msg('data-manager:settings-search.controllers.description') },
];

const ControlsPage = (props: PageProps) => {
  const { profile } = props;
  const { settings, patch } = useSettings<AppSettings>();
  const { active } = useProfiles();
  const profileId = active?.id ?? profile?.id ?? '';
  return <ControlsSettings settings={settings} onChange={patch} profileId={profileId} />;
};

export default ControlsPage;
export { meta, searchEntries };
