/* @layer renderer-widgets @kind constants */
import type { AnnotationKind } from '@rotp/navigation';
import type { GroupId } from './ScreenPanel.type';

const GROUP_OF: Partial<Record<AnnotationKind, GroupId>> = {
  chest: 'checks', 'big-chest': 'checks', 'npc-check': 'checks', 'standing-item': 'checks',
  'key-door': 'locks', 'big-key-door': 'locks', 'cell-lock': 'locks',
  shutter: 'locks', bombable: 'locks', 'follower-gate': 'locks',
  'pull-switch': 'triggers', 'kill-trigger': 'triggers',
  'key-carrier': 'triggers', 'big-key-carrier': 'triggers',
};

const GROUP_TITLES: Record<GroupId, string> = {
  checks: 'Checks',
  locks: 'Locks & barriers',
  triggers: 'Triggers',
  other: 'Unmapped',
};

const GROUP_ORDER: GroupId[] = ['checks', 'locks', 'triggers', 'other'];

export { GROUP_OF, GROUP_ORDER, GROUP_TITLES };
