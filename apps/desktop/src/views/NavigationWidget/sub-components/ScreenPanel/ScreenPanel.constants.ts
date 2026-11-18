/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { AnnotationKind, ScreenAnnotation } from '@rotp/navigation';
import type { GroupId } from './ScreenPanel.type';

const GROUP_OF: Partial<Record<AnnotationKind, GroupId>> = {
  chest: 'checks', 'big-chest': 'checks', 'npc-check': 'checks', 'standing-item': 'checks',
  'key-door': 'locks', 'big-key-door': 'locks', 'cell-lock': 'locks',
  shutter: 'locks', bombable: 'locks', 'follower-gate': 'locks',
  'pull-switch': 'triggers', 'kill-trigger': 'triggers',
  'key-carrier': 'triggers', 'big-key-carrier': 'triggers',
};

const GROUP_TITLES: Record<GroupId, Message> = {
  checks: msg('views-navigation:panel.group.checks'),
  locks: msg('views-navigation:panel.group.locks'),
  triggers: msg('views-navigation:panel.group.triggers'),
  other: msg('views-navigation:panel.group.other'),
};

const STATE_TEXT: Record<NonNullable<ScreenAnnotation['state']>, Message> = {
  open: msg('views-navigation:annotation.state.open'),
  shut: msg('views-navigation:annotation.state.shut'),
  done: msg('views-navigation:annotation.state.done'),
  available: msg('views-navigation:annotation.state.available'),
  blocked: msg('views-navigation:annotation.state.blocked'),
};

const GROUP_ORDER: GroupId[] = ['checks', 'locks', 'triggers', 'other'];

export { GROUP_OF, GROUP_ORDER, GROUP_TITLES, STATE_TEXT };
