/* @layer shared-store @kind constants */
import type { Container } from '@rotp/hub-contracts';
import { msulInstaller } from './install-msul';
import { rlangInstaller } from '@rotp/languages';
import { rspInstaller } from './install-rsp';
import type { PackInstaller } from '@rotp/hub-contracts';

const INSTALLERS: Record<Container, PackInstaller> = {
  msul: msulInstaller,
  rsp: rspInstaller,
  rlang: rlangInstaller,
};

export { INSTALLERS };
