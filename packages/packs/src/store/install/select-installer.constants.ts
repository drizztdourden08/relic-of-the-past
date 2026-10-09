/* @layer shared-store @kind constants */
import type { Container, PackInstaller } from '@rotp/hub-contracts';
import { msulInstaller } from '@rotp/msu';
import { rlangInstaller } from '@rotp/languages';
import { rspInstaller } from './install-rsp';

const INSTALLERS: Record<Container, PackInstaller> = {
  msul: msulInstaller,
  rsp: rspInstaller,
  rlang: rlangInstaller,
};

export { INSTALLERS };
