/* @layer site-kit @kind constants */
import type { AccessSource } from '@shared/hub/types';

const ANCHORS = [
  { id: 'name', label: 'Name' },
  { id: 'access', label: 'Access' },
  { id: 'sign-in', label: 'Sign-in' },
  { id: 'devices', label: 'Devices' },
];

const SOURCE_LABELS: Record<AccessSource, string> = {
  'admin-list': 'on the admin list',
  'manual-grant': 'in a group an admin set',
  'discord-role': 'via a Discord role',
  'github-collaborator': 'via GitHub collaborator',
  open: 'open to everyone signed in',
  none: 'no rule matched',
};

export { ANCHORS, SOURCE_LABELS };
