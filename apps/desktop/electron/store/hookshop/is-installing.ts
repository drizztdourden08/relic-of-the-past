/* @layer electron-main @kind logic */
import { hookshopHolder } from './hookshop-holder';
import { INSTALL_JOB_PREFIX } from './hookshop.constants';

const isInstalling = (itemId: string): boolean =>
  hookshopHolder.ctx?.jobs.list().some((job) => job.id === `${INSTALL_JOB_PREFIX}${itemId}` && job.state === 'running') ?? false;

export { isInstalling };
