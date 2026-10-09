/* @layer renderer-app @kind component */
import { useProfiles, useSettings } from '@drizztdourden08/brock-react';
import type { PageProps, ScreenMeta, SearchEntrySeed } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { ControlsSettings } from '@domains/app/views/ProfileHub/sub-components/ControlsSettings';

const meta: ScreenMeta = { title: 'Controls', icon: 'keyboard', order: 4, fill: true, keywords: ['controls', 'bindings', 'keys', 'gamepad', 'controller', 'buttons'] };

const searchEntries: SearchEntrySeed[] = [
  { label: 'Input profiles', keywords: ['input profile', 'bindings set', 'rename', 'new profile'], anchor: 'input-profiles', description: 'Sets of bindings you can switch between' },
  { label: 'Game controls', keywords: ['bindings', 'buttons', 'keys', 'classic', 'remap'], anchor: 'bindings', description: 'The SNES buttons on your keyboard or pad' },
  { label: 'Modern controls', keywords: ['modern', 'slots', 'verbs', 'items on buttons'], anchor: 'bindings', description: 'Verbs and item slots for the modern scheme' },
  { label: 'Shortcuts and functions', keywords: ['shortcut', 'hotkey', 'save state', 'turbo', 'fullscreen', 'screenshot'], anchor: 'bindings', description: 'App shortcuts such as quick save and Turbo' },
  { label: 'Cheat bindings', keywords: ['cheat', 'hotkey', 'noclip'], anchor: 'bindings', description: 'Keys that trigger cheats' },
  { label: 'Controllers', keywords: ['gamepad', 'device', 'controller', 'rescan', 'preset', 'adapter'], anchor: 'devices', description: 'Connected controllers and their presets' },
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
