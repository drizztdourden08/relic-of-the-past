/* @layer shared-store @kind logic */
/** The installer for a container. Callers never branch on the container themselves. */
import type { Container } from '../types';
import { msulInstaller } from './install-msul';
import { rspInstaller } from './install-rsp';
import { rlangInstaller } from './install-rlang';
import type { PackInstaller } from './installer.type';

const INSTALLERS: Record<Container, PackInstaller> = {
  msul: msulInstaller,
  rsp: rspInstaller,
  rlang: rlangInstaller,
};

const selectInstaller = (container: Container): PackInstaller => INSTALLERS[container];

export { selectInstaller };
