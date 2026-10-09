/* @layer site-kit @kind constants */
import checkIcon from '@iconify-icons/lucide/check';
import circleIcon from '@iconify-icons/lucide/circle';
import xIcon from '@iconify-icons/lucide/x';

const ICONS = { done: checkIcon, failed: xIcon, pending: circleIcon } as const;

export { ICONS };
